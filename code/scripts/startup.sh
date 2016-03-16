#!/usr/bin/env bash

mysql -u auction -phalloween31 < `dirname $0`/sql/init.sql
node `dirname $0`/sql/populate.js

return

