#!/bin/bash
npm run build
echo 'Generate autoload for php backend'
../mangofp/generate_autoload.sh
echo 'Build completed, will copy generated assets ...'
cp -v ./dist/js/chunk-vendors.*.js ../mangofp/assets/js/chunk-vendors.js
cp -v ./dist/js/app.*.js ../mangofp/assets/js/app.js
cp -v ./dist/css/chunk-vendors.*.css ../mangofp/assets/css/chunk-vendors.css
cp -v ./dist/css/app.*.css ../mangofp/assets/css/app.css
echo 'Syncing to the staging server ...'
rsync -Pav --exclude test --exclude *.sh --exclude README.md --delete -e "ssh -i $HOME/.ssh/zone_rsa" ../mangofp virt55795@wpkonsult.ee:/data02/virt55795/domeenid/www.wpkonsult.ee/arendus/wp-content/plugins
echo 'All done!'
 
