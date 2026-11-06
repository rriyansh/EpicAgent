.PHONY: dev build start lint test clean migrate

dev:
	cd backend && npm run dev &
	cd frontend && npm run dev

build:
	cd backend && npm run build
	cd frontend && npm run build

start:
	cd backend && npm start

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

test:
	cd backend && npm test
	cd frontend && npm test

migrate:
	cd backend && npm run migrate

clean:
	rm -rf backend/dist frontend/dist node_modules backend/node_modules frontend/node_modules
