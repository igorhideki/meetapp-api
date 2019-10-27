# Meetapp API

Meetapp é uma aplicação agregadora de eventos (meetups) para desenvolvedores.

A Meetapp API foi desenvolvida utilizando [Node.js](https://nodejs.org) e [Express](https://expressjs.com) para servir a aplicação Web e Mobile.

Outras tecnologias utilizadas na API:
* PostgreSQL
* Sequelize
* Redis
* Nodemailer
* Bee Queue
* JWT

## Instalação

Para executar a aplicação localmente é necessário ter instalado na máquina o **Node.js** (os exemplos abaixo serão utilizando **Yarn** mas ele é opcional).

1. Clone o projeto na sua máquina

2. Execute o comando `yarn install` para instalar as dependências do projeto

3. Execute o comando `yarn dev` para subir o projeto localmente, ele está configurando para abrir em `http://localhost:3333`

4. Execute o comando `yarn queue` para subir a fila de envio de e-mail

### Instruções extras

Para que a aplicação funcione totalmente é necessário executar alguns containers utilizando **docker**

* Container do postgres

```docker run --name postgres -e POSTGRES_PASSWORD=<database_password> -p 5432:5432 -d postgres```

* Container do redis

```docker run --name redis -p 6379:6379 -d -t redis:alpine```

## Funcionalidades

Abaixo estão as funcionalidades da API.

* Gerenciamento de arquivos
* Gerenciamento de meetups
* Inscrição no meetup
* Listagem de meetups
* Listagem de inscrições
