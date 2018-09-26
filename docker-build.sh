#!/bin/bash

# Stopping all containers
#docker container stop terrabrasilis_dashboard_increments
#docker container stop terrabrasilis_dashboard_aggregated
#docker container stop terrabrasilis_dashboard_daily

# build all images
docker build -t terrabrasilis/dashboard-increments:alpha --build-arg INDEX_FILE=prodes-cerrado-rates -f environment/Dockerfile .
docker build -t terrabrasilis/dashboard-daily:alpha --build-arg INDEX_FILE=deter-cerrado-daily -f environment/Dockerfile .
docker build -t terrabrasilis/dashboard-aggregated:alpha --build-arg INDEX_FILE=deter-cerrado-aggregated -f environment/Dockerfile .

# send to dockerhub
docker push terrabrasilis/dashboard-increments:alpha
docker push terrabrasilis/dashboard-daily:alpha
docker push terrabrasilis/dashboard-aggregated:alpha

# If you want run containers, uncomment this lines
#docker run -d --rm -p 80:80 --name terrabrasilis_dashboard_increments terrabrasilis/dashboard-increments:alpha
#docker run -d --rm -p 83:80 --name terrabrasilis_dashboard_aggregated terrabrasilis/dashboard-aggregated:alpha
#docker run -d --rm -p 84:80 --name terrabrasilis_dashboard_daily terrabrasilis/dashboard-daily:alpha