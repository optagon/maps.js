
<?php
 
    require(__DIR__ . "/../includes/config.php");
 
    // numerically indexed array of places
    $input = $_GET["geo"];
    $place = [];
    $spliter = preg_split("/[^a-zA-Z\d]/", $input, -1, PREG_SPLIT_NO_EMPTY);
    $last = array_pop($spliter);
    
 
    if (is_numeric($last))
    {
        $zip = intval($last) -1;
    }
    else
    {
        array_push($spliter, $last);
    }
 
    // Implode the parts back together after checking for zip code
    $place = implode(" ", $spliter);
 
   
    $noZip = CS50::query("SELECT * FROM places WHERE MATCH
     (place_name,
    admin_name1,
    admin_code1,
    admin_name2,
    admin_code2,
    admin_name3,
    admin_code3)
    AGAINST (? IN NATURAL LANGUAGE MODE) AND postal_code != $input", $place);
    
    
    $onlyZip = CS50::query("SELECT * FROM places WHERE NOT MATCH
    (place_name,
    admin_name1,
    admin_code1,
    admin_name2,
    admin_code2,
    admin_name3,
    admin_code3)
    AGAINST (? IN NATURAL LANGUAGE MODE) AND postal_code =  $input", $place);
 

    $withZip = CS50::query("SELECT * FROM places WHERE MATCH 
    (place_name,
    admin_name1,
    admin_code1,
    admin_name2,
    admin_code2,
    admin_name3,
    admin_code3)
    AGAINST (? IN NATURAL LANGUAGE MODE) AND postal_code =  $input", $place);
 
    // put results together
    $place = array_merge($withZip, $onlyZip, $noZip);
 
    // output places as JSON (pretty-printed for debugging convenience)
    header("Content-type: application/json");
    print(json_encode($place, JSON_PRETTY_PRINT));
 
?>

