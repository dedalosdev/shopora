# shopora
Shopora is an open-source e-commerce platform featuring a React web interface, a React Native mobile app, a Python/Django/DjangoRestFramework backend and PostgreSQL database. Designed for learning, personal use, and commercial projects, it provides a flexible foundation for building and customizing online stores.

## Included
- `accounts`: customer profile and addresses
- `catalog`: categories, products, variants and images
- `inventory`: stock balances and movements
- `cart`: shopping carts and items
- `orders`: orders and order items
- `payments`: payment records and provider webhooks
- `shipping`: shipments
- `coupons`: coupon validation and redemption
- `notifications`: notification records
- `storefront`: public store settings and banners
- `common`: shared utilities and health endpoint

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

cd shopora/backend
cp .env.example .env
Edit the database credentials

cd backend
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
python manage.py createsuperuser

cd frontend
npm install

# run application
cd backend
python3 manage.py runserver
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