#!/bin/bash
#npm run build
echo 'Generate autoload for php backend'
../mangofp/generate_autoload.sh
echo '*** Staging'
echo 'Build completed, will stagge generated assets ...'
cp -v ./dist/js/chunk-vendors.*.js ../mangofp/stage/assets/js/chunk-vendors.js
cp -v ./dist/js/app.*.js ../mangofp/stage/assets/js/app.js
cp -v ./dist/css/chunk-vendors.*.css ../mangofp/stage/assets/css/chunk-vendors.css
cp -v ./dist/css/app.*.css ../mangofp/stage/assets/css/app.css
echo 'Staging backend'
cp -rv ../mangofp/src ../mangofp/stage/
#cp -rv ../mangofp/assets ../mangofp/assets/
cp -rv ../mangofp/mangofp.php ../mangofp/stage/
cp -rv ../mangofp/autoload.php ../mangofp/stage/
echo 'Syncing to the staging server ...'
rsync -Pav --delete -e "ssh -i $HOME/.ssh/zone_rsa" ../mangofp/stage virt55795@wpkonsult.ee:/data02/virt55795/domeenid/www.wpkonsult.ee/arendus/wp-content/plugins
echo 'All done!'
 