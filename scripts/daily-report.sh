#!/bin/bash
echo "=== PSY-NEXUS Daily Report ===" >> /var/log/nexus-daily.log
date >> /var/log/nexus-daily.log
echo "PM2 Restarts: $(pm2 list | grep psy-backend | awk '{print $4}')" >> /var/log/nexus-daily.log
echo "Swap Usage: $(free -h | grep Swap | awk '{print $3}')" >> /var/log/nexus-daily.log
echo "RAM Available: $(free -h | grep Mem | awk '{print $7}')" >> /var/log/nexus-daily.log
echo "==============================" >> /var/log/nexus-daily.log
