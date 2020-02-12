#!/bin/bash
npm run build
echo 'Build completed, will copy generated assets ...'
cp -v ./dist/js/chunk-vendors.*.js ../peaches/assets/js/chunk-vendors.js
cp -v ./dist/js/app.*.js ../peaches/assets/js/app.js
cp -v ./dist/css/chunk-vendors.*.css ../peaches/assets/css/chunk-vendors.css
cp -v ./dist/css/app.*.css ../peaches/assets/css/app.css
echo 'Syncing to the staging server ...'
rsync -Pav --exclude -e "ssh -i $HOME/.ssh/zone_rsa" ../peaches/ virt55795@wpkonsult.ee:/data02/virt55795/domeenid/www.wpkonsult.ee/arendus/wp-content/plugins/mangofp
echo 'All done!'
 
