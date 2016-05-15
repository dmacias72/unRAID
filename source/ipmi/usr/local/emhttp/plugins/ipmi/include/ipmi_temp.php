<?
require_once '/usr/local/emhttp/plugins/ipmi/include/ipmi_helpers.php';
require_once '/usr/local/emhttp/plugins/ipmi/include/ipmi_settings_display.php';

function format_ipmi_temp($reading, $unit, $dot) {
  return (($reading != 0) ? ($unit=='F' ? round(9/5*$reading+32) : str_replace('.',$dot,$reading))."<small>&deg;$unit</small>" : '##');
}

$disp_sensors = [$disp_sensor1, $disp_sensor2, $disp_sensor3, $disp_sensor4];

if (!empty($disp_sensors)){
    if(($ipmi) || ($netsvc == 'enable'))
        $readings = ipmi_sensors();
    $displays = [];
    foreach($disp_sensors as $disp_sensor){
        if ($readings[$disp_sensor]){
            $disp_name    = $readings[$disp_sensor]['Name'];
            $disp_id      = $readings[$disp_sensor]['ID'];
            $disp_reading = $readings[$disp_sensor]['Reading'];
            $LowerNR = floatval($readings[$disp_sensor]['LowerNR']);
            $LowerC  = floatval($readings[$disp_sensor]['LowerC']);
            $LowerNC = floatval($readings[$disp_sensor]['LowerNC']);
            $UpperNC = floatval($readings[$disp_sensor]['UpperNC']);
            $UpperC  = floatval($readings[$disp_sensor]['UpperC']);
            $UpperNR = floatval($readings[$disp_sensor]['UpperNR']);
            $Color = ($disp_reading == 'N/A') ? 'blue' : 'green';

            if($readings[$disp_sensor]['Type'] == 'Temperature'){
                // if temperature is greater than upper non-critical show critical
                if ($disp_reading > $UpperNC)
                    $Color = 'orange';

                    // if temperature is greater than upper critical show non-recoverable
                if ($disp_reading > $UpperC)
                    $Color = 'red';

                $displays[] = "<img src='/plugins/ipmi/icons/cpu.png' title='$disp_name ($disp_id)' class='icon'><font color='$Color'>".
                    format_ipmi_temp(floatval($disp_reading), $_GET['unit'], $_GET['dot']).'</font>';
            }elseif($readings[$disp_sensor]['Type'] == 'Fan'){
                // if Fan RPMs are less than lower non-critical
                if ($disp_reading < $LowerNC || $disp_reading < $LowerC || $disp_reading < $LowerNR)
                    $Color = "red";

                $displays[] = "<img src='/plugins/ipmi/icons/fan.png' title='$disp_name ($disp_id)' class='icon'><font color='$Color'>".
                    floatval($disp_reading)."</font><small>&thinsp;rpm</small>";
            }
        }
    }
}
if ($displays)
    echo "<span id='temps' style='margin-right:16px;font-weight: bold;'>".implode('&nbsp;', $displays)."</span>";
?>
