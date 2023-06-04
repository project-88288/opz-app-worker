# opz-app-worker

npm install

npm start

3. Setup the database
  
    * Install postgreSQL
    ```
    sudo apt update
    sudo apt install postgresql postgresql-contrib
    psql --version

    sudo service postgresql status
    sudo service postgresql start
    sudo service postgresql status

    ``` 
    * Seting
    ```
    sudo -u postgres createuser dev
    sudo -u postgres createdb workermainnet

    sudo -u postgres psql
    postgres=# grant all privileges on database "workermainnet" to dev;
    GRANT
    postgres=# alter user dev with encrypted password 'dev';
    ALTER ROLE
    postgres=#\q

    ```
    * Testing postgreSQL
    ```
    sudo -u postgres psql workermainnet
    .. \dt
    .. \l
    workermainnet=# \l
    workermainnet=# \dt

            List of relations
    Schema |        Name         | Type  | Owner
    --------+---------------------+-------+-------
    public | block               | table | dev
    public | exchange_rate       | table | dev
    public | migrations          | table | dev
    public | pair_day_data       | table | dev
    public | pair_hour_data      | table | dev
    public | pair_info           | table | dev
    public | recent_24h          | table | dev
    public | terra_swap_day_data | table | dev
    public | token_info          | table | dev
    public | tx_history          | table | dev
    (10 rows)

    workermainnet=# select * from pair_info;
    opz-lab-Testnet=# select * from exchange_rate;
    opz-lab-Testnet=# select * from pair_day_data;
    opz-lab-Testnet=#
    ```
    * Using postgreSQL
    ```
    sudo -u postgres psql
    psql=#\q
    ```
    * login postgres as root
    ```
    sudo su - postgres
    psql
    ```
    * connect to database
    ```
    sudo -u postgres psql opz-lab-phoenix-1;
    ```
    * create a database
    ```psql
    postgres => create user alice;
    postgres => create database opz-lab-phoenix-1 owner alice;
    ```
