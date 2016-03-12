<?php
$cmdline_cfg = parse_plugin_cfg("cmdline");
$shellinabox_ipaddr = isset($cmdline_cfg['IPADDR']) ? $cmdline_cfg['IPADDR'] 	: "disable";
$shellinabox_host = ($shellinabox_ipaddr == "disable") ? $var['NAME'] : $var['IPADDR'];
$shellinabox_port = (isset($cmdline_cfg['PORT']) && is_numeric($cmdline_cfg['PORT']) && $cmdline_cfg['PORT'] > 0 && $cmdline_cfg['PORT'] < 65535 ) ? $cmdline_cfg['PORT'] : "4200";
$shellinabox_running = trim(shell_exec( "[ -f /proc/`cat /var/run/shellinaboxd.pid 2> /dev/null`/exe ] && echo 1 || echo 0 2> /dev/null" ));
$status_running = "<span class='green'>Running</span>";
$status_stopped = "<span class='orange'>Stopped</span>";
$shellinabox_status = ($shellinabox_running) ? $status_running : $status_stopped;
?>