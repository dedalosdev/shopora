# shopora
Shopora is an open-source e-commerce platform featuring a React web interface, a React Native mobile app, a Python/Django/DjangoRestFramework backend and PostgreSQL database. Designed for learning, personal use, and commercial projects, it provides a flexible foundation for building and customizing online stores.

## Included
- `store`: business rules from store


# database settings
psql postgres
postgres=# create role postgres with login password 'yourpassword';
postgres=# alter role postgres with login password 'yourpassword';
ALTER ROLE
postgres=# alter role postgres superuser createdb createrole;
ALTER ROLE
postgres=# create database shopora_db owner postgres;
CREATE DATABASE
postgres=# \l
postgres=# \q

# instalation instructions
git clone https://github.com/dedalosdev/shopora.git

cd shopora
cd backend
cp .env.example .env
Edit the database credentials
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
python manage.py createsuperuser

cd frontend
cp .env.example .env
Edit API URL
npm install

cd mobile
cp .env.example .env
Edit API URL
npm install

# run application
cd backend
python3 manage.py runserver 0.0.0.0:8000

cd frontend
npm run

cd mobile
npx expo start
type 'a' key to run android emulator

# URLs
- `http://127.0.0.1:8000/api/v1/`: The API's urls
- `http://127.0.0.1:8000/api/docs/`:The API documentation
- `http://127.0.0.1:8000/admin/`: The administration interface

## License

Shopora is an open-source project licensed under the MIT License.

You are free to use, copy, modify, distribute, sublicense, and
commercialize this project for personal, educational, or commercial
purposes, subject to the terms of the MIT License.

See the [LICENSE](./LICENSE) file for the complete license text.