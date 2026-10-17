# payments/asaas.py

import requests

from django.conf import settings


class AsaasError(Exception):
    pass


def asaas_request(
    method: str,
    endpoint: str,
    *,
    json=None,
    params=None,
):
    url = (
        f"{settings.ASAAS_API_URL.rstrip('/')}/"
        f"{endpoint.lstrip('/')}"
    )

    response = requests.request(
        method=method,
        url=url,
        headers={
            "access_token": settings.ASAAS_API_KEY,
            "User-Agent": "Shopora/1.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        json=json,
        params=params,
        timeout=30,
    )

    if not response.ok:
        try:
            detail = response.json()
        except ValueError:
            detail = response.text

        raise AsaasError(
            f"Asaas HTTP {response.status_code}: {detail}"
        )

    if not response.content:
        return None

    return response.json()


def find_asaas_customer_by_email(email: str):
    data = asaas_request(
        "GET",
        "/customers",
        params={
            "email": email,
            "limit": 1,
        },
    )

    customers = data.get("data", [])

    return customers[0] if customers else None


def create_asaas_customer(
    *,
    name: str,
    email: str,
    external_reference: str,
    mobile_phone: str | None = None,
):
    payload = {
        "name": name,
        "email": email,
        "externalReference": external_reference,
    }

    if mobile_phone:
        payload["mobilePhone"] = mobile_phone

    return asaas_request(
        "POST",
        "/customers",
        json=payload,
    )    
    
    
def create_asaas_checkout(
    *,
    customer_id: str,
    order,
    method: str,
):
    if method == "pix":
        billing_types = ["PIX"]
        charge_types = ["DETACHED"]

    elif method == "credit_card":
        billing_types = ["CREDIT_CARD"]
        charge_types = ["DETACHED"]

    else:
        raise ValueError(
            f"Unsupported payment method: {method}"
        )

    items = []

    for item in order.items.all():
        items.append(
            {
                "name": item.product_name,
                "description": item.product_name,
                "quantity": item.quantity,
                "value": float(item.unit_price),
            }
        )

    payload = {
        "customer": customer_id,

        "billingTypes": billing_types,

        "chargeTypes": charge_types,

        "minutesToExpire": 60,

        "externalReference": str(order.id),

        "callback": {
            "successUrl": (
                "https://shopora.com/payment/success"
            ),
            "cancelUrl": (
                "https://shopora.com/payment/cancelled"
            ),
            "expiredUrl": (
                "https://shopora.com/payment/expired"
            ),
        },

        "items": items,
    }

    return asaas_request(
        "POST",
        "/checkouts",
        json=payload,
    )