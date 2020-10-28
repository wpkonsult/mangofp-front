#!/bin/bash
npm run build
echo 'Generate autoload for php backend'
echo '*** Staging'
echo 'Build completed, will stage generated assets for contacts...'
mkdir -p ../mangofp/stage/assets/js
mkdir -p ../mangofp/stage/assets/css

cp -v ./dist/js/chunk-vendors.*.js ../mangofp/stage/assets/js/chunk-vendors.js
cp -v ./dist/js/app.*.js ../mangofp/stage/assets/js/app.js
cp -v ./dist/css/chunk-vendors.*.css ../mangofp/stage/assets/css/chunk-vendors.css
cp -v ./dist/css/app.*.css ../mangofp/stage/assets/css/app.css
echo 'Build completed, will stage generated assets for settings...'

CURRENTDIR=$(pwd)
cd ../mangofp-settings-ts
npm run build
cd $CURRENTDIR

mkdir -p ../mangofp/stage/assets/settings/js
mkdir -p ../mangofp/stage/assets/settings/css

cp -v ../mangofp-settings-ts/dist/js/chunk-vendors.*.js ../mangofp/stage/assets/settings/js/chunk-vendors.js
cp -v ../mangofp-settings-ts/dist/js/chunk-vendors.*.js.map ../mangofp/stage/assets/settings/js/.
cp -v ../mangofp-settings-ts/dist/js/app.*.js ../mangofp/stage/assets/settings/js/app.js
cp -v ../mangofp-settings-ts/dist/js/app.*.js.map ../mangofp/stage/assets/settings/js/.
cp -v ../mangofp-settings-ts/dist/css/chunk-vendors.*.css ../mangofp/stage/assets/settings/css/chunk-vendors.css
cp -v ../mangofp-settings-ts/dist/css/app.*.css ../mangofp/stage/assets/settings/css/app.css
echo 'Staging '
echo 'Staging backend'
../mangofp/generate_autoload.sh
../mangofp/stage_backend.sh
echo 'Syncing to the staging server ...'
rsync -Pav --delete -e "ssh -i $HOME/.ssh/zone_rsa" ../mangofp/stage/ virt55795@wpkonsult.ee:/data02/virt55795/domeenid/www.wpkonsult.ee/arendus/wp-content/plugins/mangofp/
echo 'All done!'
