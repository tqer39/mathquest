locals {
  contact = {
    postal_address = {
      region_code         = var.contact_country_code
      postal_code         = var.contact_postal_code
      administrative_area = var.contact_administrative_area
      locality            = var.contact_locality
      address_lines       = var.contact_address_lines
      recipients          = [var.contact_recipient]
      organization        = null
    }
    email_address = var.contact_email
    phone_number  = var.contact_phone
    fax_number    = null
  }
}

resource "cloudflare_zone" "root" {
  account = {
    id = var.cloudflare_account_id
  }
  name = var.root_domain

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_clouddomains_registration" "root" {
  count = var.create_domain_registration ? 1 : 0

  domain_name = var.root_domain
  location    = "global"

  yearly_price {
    currency_code = var.yearly_price_currency
    units         = var.yearly_price_units
  }

  contact_settings {
    privacy = "PRIVATE_CONTACT_DATA"

    registrant_contact {
      email        = local.contact.email_address
      phone_number = local.contact.phone_number
      fax_number   = local.contact.fax_number

      postal_address {
        region_code         = local.contact.postal_address.region_code
        postal_code         = local.contact.postal_address.postal_code
        administrative_area = local.contact.postal_address.administrative_area
        locality            = local.contact.postal_address.locality
        address_lines       = local.contact.postal_address.address_lines
        recipients          = local.contact.postal_address.recipients
        organization        = local.contact.postal_address.organization
      }
    }

    admin_contact {
      email        = local.contact.email_address
      phone_number = local.contact.phone_number
      fax_number   = local.contact.fax_number

      postal_address {
        region_code         = local.contact.postal_address.region_code
        postal_code         = local.contact.postal_address.postal_code
        administrative_area = local.contact.postal_address.administrative_area
        locality            = local.contact.postal_address.locality
        address_lines       = local.contact.postal_address.address_lines
        recipients          = local.contact.postal_address.recipients
        organization        = local.contact.postal_address.organization
      }
    }

    technical_contact {
      email        = local.contact.email_address
      phone_number = local.contact.phone_number
      fax_number   = local.contact.fax_number

      postal_address {
        region_code         = local.contact.postal_address.region_code
        postal_code         = local.contact.postal_address.postal_code
        administrative_area = local.contact.postal_address.administrative_area
        locality            = local.contact.postal_address.locality
        address_lines       = local.contact.postal_address.address_lines
        recipients          = local.contact.postal_address.recipients
        organization        = local.contact.postal_address.organization
      }
    }
  }

  dns_settings {
    custom_dns {
      name_servers = cloudflare_zone.root.name_servers
    }
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      # ドメイン登録後は変更しない
      yearly_price,
      contact_settings,
    ]
  }

  timeouts {
    create = "10m"
    update = "10m"
  }
}
