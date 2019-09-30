#!/bin/bash

# Stopping all containers
#docker container stop terrabrasilis_cerrado_alert_aggregated
#docker container stop terrabrasilis_cerrado_alert_daily

# build all images
docker build -t terrabrasilis/cerrado-alert-daily:v2.5 --build-arg INDEX_FILE=deter-cerrado-daily -f environment/Dockerfile .
docker build -t terrabrasilis/cerrado-alert-aggregated:v2.5 --build-arg INDEX_FILE=deter-cerrado-aggregated -f environment/Dockerfile .

# send to dockerhub
# docker login
docker push terrabrasilis/cerrado-alert-daily:v2.5
docker push terrabrasilis/cerrado-alert-aggregated:v2.5

# If you want run containers, uncomment this lines
#docker run -d --rm -p 83:80 --name terrabrasilis_cerrado_alert_aggregated terrabrasilis/cerrado-alert-aggregated:v2.5
#docker run -d --rm -p 84:80 --name terrabrasilis_cerrado_alert_daily terrabrasilis/cerrado-alert-daily:v2.5