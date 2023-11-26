const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//get ###############        1

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  if (status === 'TO DO' && priority === '' && search_q === '') {
    const getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     status LIKE '${status}';`
    const booksArray = await db.all(getBooksQuery)
    response.send(booksArray)
  } else if (status === '' && priority === 'HIGH' && search_q === '') {
    const getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     priority LIKE '${priority}';`
    const booksArray = await db.all(getBooksQuery)

    response.send(booksArray)
  } else if (
    status === 'IN PROGRESS' &&
    priority === 'HIGH' &&
    search_q === ''
  ) {
    const getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     priority LIKE '${priority}'  AND status LIKE '${status}';`
    const booksArray = await db.all(getBooksQuery)
    response.send(booksArray)
  } else if (status === '' && priority === '' && search_q === 'Play') {
    const getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     todo LIKE '%${search_q}%';`
    const booksArray = await db.all(getBooksQuery)
    response.send(booksArray)
  }
})

//get    2

app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params

  const getBooksQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
      id = ${todoId}  ;`
  const booksArray = await db.get(getBooksQuery)
  response.send(booksArray)
})

// post    3

app.post('/todos/', async (request, response) => {
  const bookDetails = request.body
  const {id, todo, priority, status} = bookDetails
  const addBookQuery = `
    INSERT INTO
      todo (id,todo,priority,status)
    VALUES
      (
        ${id},
         '${todo}',
         '${priority}',
         '${status}'
      );`

  const dbResponse = await db.run(addBookQuery)
  response.send('Todo Successfully Added')
})
//put     4

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const bookDetails = request.body
  const {status = '', priority = '', todo = ''} = bookDetails
  if (priority === '' && todo === '') {
    const updateBookQuery = `
    UPDATE
       todo
    SET
      status='${status}'
    WHERE
      id = ${todoId};`
    await db.run(updateBookQuery)
    response.send('Status Updated')
  } else if (status === '' && todo === '') {
    const updateBookQuery = `
    UPDATE
       todo
    SET
      priority='${priority}'
    WHERE
      id = ${todoId};`
    await db.run(updateBookQuery)
    response.send('Priority Updated')
  } else if (status === '' && priority === '') {
    const updateBookQuery = `
    UPDATE
       todo
    SET
      todo='${todo}'
    WHERE
      id = ${todoId};`
    await db.run(updateBookQuery)
    response.send('Todo Updated')
  }
})
// delete 5

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`
  await db.run(deleteBookQuery)
  response.send('Todo Deleted')
})

module.exports = app
