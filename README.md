# Web-Page

## Update submodule

```sh
    git submodule init
    git submodule update --recursive --remote
``` 

## Add Submodule (example)

```sh
    cd content
    git pull origin release
    cd ..
    git add content
    git commit -m "Submodule Updated"
``` 

## Install node-server (Connect to DataBase)

```sh
    npm init -y
    npm install express mssql cors
``` 