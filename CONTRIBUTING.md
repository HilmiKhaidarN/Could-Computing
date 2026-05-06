# Contributing to AegisOps

Terima kasih atas minat Anda untuk berkontribusi pada AegisOps! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

Proyek ini mengikuti prinsip:
- Bersikap hormat dan profesional
- Menerima kritik konstruktif
- Fokus pada apa yang terbaik untuk komunitas
- Menunjukkan empati terhadap anggota komunitas lainnya

## 🚀 Getting Started

1. **Fork repository** ini
2. **Clone** fork Anda:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Could-Computing.git
   cd Could-Computing/aegisops
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/HilmiKhaidarN/Could-Computing.git
   ```
4. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   
   # ML Service
   cd ../ml-service && pip install -r requirements.txt
   ```

## 🔄 Development Workflow

1. **Sync dengan upstream**:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # atau
   git checkout -b fix/bug-description
   ```

3. **Make your changes**

4. **Test your changes**:
   ```bash
   # Backend
   cd backend && npm test
   
   # Frontend
   cd frontend && npm run type-check
   
   # ML Service
   cd ml-service && pytest
   ```

5. **Commit your changes** (lihat [Commit Guidelines](#commit-guidelines))

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request** ke `main` branch

## 💻 Coding Standards

### TypeScript/JavaScript (Backend & Frontend)

- Gunakan **TypeScript** untuk type safety
- Follow **ESLint** rules yang sudah dikonfigurasi
- Gunakan **Prettier** untuk formatting
- Naming conventions:
  - `camelCase` untuk variables dan functions
  - `PascalCase` untuk classes dan components
  - `UPPER_SNAKE_CASE` untuk constants
  - `kebab-case` untuk file names

### Python (ML Service)

- Follow **PEP 8** style guide
- Gunakan **type hints** untuk function signatures
- Docstrings untuk semua public functions
- Maximum line length: 100 characters

### General

- Write **self-documenting code**
- Add comments untuk logic yang kompleks
- Keep functions small dan focused
- Avoid code duplication (DRY principle)

## 📝 Commit Guidelines

Gunakan **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Scopes

- `backend`: Backend changes
- `frontend`: Frontend changes
- `ml`: ML service changes
- `docker`: Docker/infrastructure changes
- `ci`: CI/CD changes
- `db`: Database changes

### Examples

```bash
feat(backend): add report filtering by category

fix(frontend): resolve map marker clustering issue

docs: update deployment instructions

chore(ci): update GitHub Actions workflow
```

## 🔍 Pull Request Process

1. **Update documentation** jika diperlukan
2. **Add tests** untuk new features
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** jika applicable
5. **Fill PR template** dengan lengkap
6. **Request review** dari maintainers
7. **Address review comments**
8. **Squash commits** jika diminta

### PR Title Format

```
<type>(<scope>): <description>
```

Example: `feat(backend): add analytics endpoint for report trends`

## ✅ Testing Guidelines

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
```

- Write unit tests untuk services
- Write integration tests untuk controllers
- Mock external dependencies
- Aim for >80% code coverage

### Frontend Tests

```bash
cd frontend
npm test                # Run tests
npm run type-check      # TypeScript check
```

- Test components dengan React Testing Library
- Test hooks dengan renderHook
- Test user interactions
- Snapshot tests untuk UI components

### ML Service Tests

```bash
cd ml-service
pytest tests/ -v                    # Run all tests
pytest tests/ -v --cov=.           # With coverage
```

- Test predictor logic
- Test API endpoints
- Test input validation
- Test error handling

## 🐛 Reporting Bugs

Gunakan **Bug Report template** di GitHub Issues:

1. Clear description
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details
5. Screenshots jika applicable

## 💡 Suggesting Features

Gunakan **Feature Request template** di GitHub Issues:

1. Problem statement
2. Proposed solution
3. Alternative solutions
4. Mockups jika applicable

## 📞 Questions?

- Open a **Discussion** di GitHub
- Tag maintainers di issue/PR
- Email: [your-email@example.com]

## 🙏 Thank You!

Kontribusi Anda membuat AegisOps lebih baik untuk semua orang. Terima kasih! ❤️
