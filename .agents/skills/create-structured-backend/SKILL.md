---
name: create-structured-backend
description: Scaffold a highly structured Django REST Framework backend based on robust best practices. Trigger this skill whenever the user wants to create a new backend, API, or Django project from a workflow or specification, ensuring a production-ready, modular architecture.
---

# Create Structured Backend

You are tasked with scaffolding a complete Django REST Framework (DRF) backend from a user-provided workflow or schema. This architecture strictly follows robust, production-ready structural patterns.

## Core Architecture
- **Language**: Python 3.13 
- **Framework**: Django + Django REST Framework
- **Database**: PostgreSQL 17
- **Dockerized Foundation**: `Dockerfile` and `docker-compose.yml` 

## Project Structure
When scaffolding the new backend, always generate exactly this structure:

```text
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
├── Procfile
├── README.md
├── docker-compose.yml
├── entrypoint.sh
├── manage.py
├── package.json
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── [core_project_name]/    (e.g., config, core, or user-defined project name)
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── apps/                   (All custom Django apps MUST go here)
    ├── __init__.py
    └── [feature_app]/
        ├── __init__.py
        ├── admin.py
        ├── apps.py
        ├── filters.py
        ├── models.py
        ├── permissions.py
        ├── serializers.py
        ├── urls.py
        └── views.py
```

## Implementation Rules
1. **Module Architecture**: Do not create Django apps in the root directory. ALL custom applications must be created inside `apps/`.
2. **Robust API Structure**: Each application within `apps/` must utilize DRF best practices, splitting logic into clear concerns:
   - `models.py` for database schemas.
   - `serializers.py` for data validation and representation.
   - `views.py` (preferably ModelViewSet or APIView) for request logic.
   - `permissions.py` for custom access rules.
   - `filters.py` for DRF filtering.
   - `urls.py` containing a router for the app's views.
3. **Containerization & Deployment**:
   - `Dockerfile` must use the `python:3.13-slim` image and include the relevant `apt-get` packages (like `libpq-dev`, `build-essential`).
   - `docker-compose.yml` must include a `web` service and a `db` service running `postgres:17`.
   - `entrypoint.sh` should execute migrations before launching the application.
4. **Dependencies**: Use the multi-file layout in `/requirements` where `prod.txt`/`dev.txt` import from `base.txt`, ensuring a clean separation of environments.
5. **Node.js Integration**: Ensure a `package.json` is generated for standard frontend/asset toolchain dependencies (such as `@mui/material`) if the project requires SSR or frontend tooling integration alongside the backend.

## Execution Steps
1. Analyze the user's provided workflow/features.
2. Outline the Django apps that need to be created inside `apps/`.
3. Create the configuration files (`Dockerfile`, `docker-compose.yml`, `requirements/*`, `manage.py`, etc.).
4. Generate the root project configuration.
5. Scaffold the requested applications with fully implemented models, views, and serializers mapping to the workflow.
