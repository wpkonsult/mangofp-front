#!/bin/bash
echo 'Generate autoload for php backend'
echo '*** Staging only backend'
../mangofp/generate_autoload.sh
../mangofp/stage_backend.sh
echo 'Syncing to the staging server ...'
rsync -Pav --delete -e "ssh -i $HOME/.ssh/zone_rsa" ../mangofp/stage virt55795@wpkonsult.ee:/data02/virt55795/domeenid/www.wpkonsult.ee/arendus/wp-content/plugins
echo 'All done!'
