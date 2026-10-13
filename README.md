# shopora
Shopora is an open-source e-commerce platform featuring a React web interface, a React Native mobile app, a Python/Django/DjangoRestFramework backend and PostgreSQL database. Designed for learning, personal use, and commercial projects, it provides a flexible foundation for building and customizing online stores.

# database settings
psql postgres
postgres=# create role postgres with login password 'yourpassword';
postgres=# alter role postgres with login password 'yourpassword';
ALTER ROLE
postgres=# alter role postgres superuser createdb createrole;
ALTER ROLE
postgres=# create database ecommerce_db owner postgres;
CREATE DATABASE
postgres=# \l
postgres=# \q

# instalation instructions
git clone https://github.com/dedalosdev/shopora.git

cd shopora
create .env file
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432

cd backend
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate

# run application
cd backend
python3 manage.py runserver
cd frontend
npm run
cd mobile
npx expo start
type 'a' key to run android emulator

## License

Shopora is an open-source project licensed under the MIT License.

You are free to use, copy, modify, distribute, sublicense, and
commercialize this project for personal, educational, or commercial
purposes, subject to the terms of the MIT License.

See the [LICENSE](./LICENSE) file for the complete license text.