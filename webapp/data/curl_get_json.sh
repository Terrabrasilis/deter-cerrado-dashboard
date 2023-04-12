#!/bin/bash

# the workspace name into GeoServer
PROJECT_NAME="deter-cerrado-nb"
# the Geoserver base url
BASE_URL="http://terrabrasilis.dpi.inpe.br/geoserver"

# download daily data to work local
URL="${BASE_URL}/${PROJECT_NAME}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=all_daily_d&OUTPUTFORMAT=csv"
curl "$URL" -H 'User-Agent: Shell script with CURL' --compressed -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-cerrado-daily.csv

URL="${BASE_URL}/${PROJECT_NAME}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=updated_date&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Shell script with CURL' --compressed -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > updated-date.json

exit

# to test cloud monthly data
URL="${BASE_URL}/${PROJECT_NAME}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=cloud_m_d&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-cerrado-cloud-month.json

# download daily data to work local
URL="${BASE_URL}/${PROJECT_NAME}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=all_daily_d&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-cerrado-daily.json

# download month aggregated data to work local
URL="${BASE_URL}/${PROJECT_NAME}/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=month_d&OUTPUTFORMAT=application%2Fjson"
curl "$URL" -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,en-US;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' > deter-cerrado-month.json
