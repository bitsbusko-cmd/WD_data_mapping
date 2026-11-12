<?php
/* Workday → Xpertis: wspólna baza decyzji (jeden plik JSON, bez bazy danych).
   GET  api.php?ping          – czy serwer działa (bez hasła)
   GET  api.php?since=N       – wpisy zmienione po numerze N (nagłówek X-Team-Key)
   POST api.php               – {"ch": [[id, wpis], ...]} – nowszy wpis (ts) wygrywa  */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out(int $code, array $body): void { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }

$TEAM_KEY = '';
if (is_file(__DIR__ . '/config.php')) require __DIR__ . '/config.php';
$configured = is_string($TEAM_KEY) && strlen($TEAM_KEY) >= 10 && $TEAM_KEY !== 'ZMIEN-TO-HASLO';

if (isset($_GET['ping'])) out(200, ['app' => 'wd-xpertis', 'v' => 1, 'configured' => $configured]);
if (!$configured) out(503, ['error' => 'config']);
$key = $_SERVER['HTTP_X_TEAM_KEY'] ?? '';
if (!is_string($key) || !hash_equals($TEAM_KEY, $key)) { usleep(300000); out(401, ['error' => 'auth']); }

$dir = __DIR__ . '/data';
if (!is_dir($dir) && !mkdir($dir, 0750, true)) out(500, ['error' => 'storage']);
if (!is_file($dir . '/.htaccess')) @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
$fp = fopen($dir . '/state.json', 'c+');
if (!$fp) out(500, ['error' => 'storage']);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
flock($fp, $method === 'POST' ? LOCK_EX : LOCK_SH);
$raw = stream_get_contents($fp);
$db = $raw ? json_decode($raw, true) : null;
if (!is_array($db) || !isset($db['seq'], $db['e'])) $db = ['seq' => 0, 'e' => []];

if ($method === 'GET') {
  $since = max(0, (int)($_GET['since'] ?? 0));
  $list = [];
  foreach ($db['e'] as $id => $x) if ($x['sq'] > $since) $list[] = [$id, $x['v']];
  flock($fp, LOCK_UN); fclose($fp);
  out(200, ['seq' => $db['seq'], 'e' => $list]);
}
if ($method !== 'POST') out(405, ['error' => 'method']);

$body = file_get_contents('php://input', false, null, 0, 8 * 1024 * 1024);
$in = json_decode($body ?: '', true);
if (!is_array($in) || !isset($in['ch']) || !is_array($in['ch']) || count($in['ch']) > 20000) out(400, ['error' => 'input']);

$FIELDS = ['n', 't', 'fmt', 'det', 'note', 'why', 'fmtTouched', 'ts', 'by', 'ok', 'miss', 'notes', 'done',
  'k', 'ty', 'to', 'tx', 'nm', 'tm', 'at', 'rby', 'rat', 'rn', 'ev', 'ref']; // ostatnie: wpisy dyskusji i historia próśb
$acc = 0;
foreach ($in['ch'] as $c) {
  if (!is_array($c) || count($c) !== 2) continue;
  [$id, $v] = $c;
  if (!is_string($id) || !preg_match('/^\d{1,3}\|[facm]\|.{0,400}$/u', $id) || !is_array($v)) continue;
  $clean = [];
  foreach ($FIELDS as $f) if (array_key_exists($f, $v)) {
    $x = $v[$f];
    if (is_bool($x) || is_int($x)) $clean[$f] = $x;
    elseif (is_string($x)) $clean[$f] = function_exists('mb_substr') ? mb_substr($x, 0, 10000) : substr($x, 0, 30000);
  }
  if (!isset($clean['ts']) || !is_string($clean['ts']) || strlen($clean['ts']) > 40) continue;
  $old = $db['e'][$id]['v']['ts'] ?? '';
  if (strcmp($clean['ts'], (string)$old) <= 0) continue;
  $db['seq']++;
  $db['e'][$id] = ['sq' => $db['seq'], 'v' => $clean];
  $acc++;
}
if ($acc) {
  ftruncate($fp, 0); rewind($fp);
  fwrite($fp, json_encode($db, JSON_UNESCAPED_UNICODE));
  fflush($fp);
}
flock($fp, LOCK_UN); fclose($fp);
out(200, ['ok' => $acc, 'seq' => $db['seq']]);
