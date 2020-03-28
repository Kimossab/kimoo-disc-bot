#!/bin/sh
clear
rm -R ./build
echo "compiling"
./node_modules/.bin/tsc
echo "compiled and copying resources"
cp -r ./resources ./build/