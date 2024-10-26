// GraphQLを呼び出す側のサンプルコード
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const main = async () => {
  const client = new ApolloClient({
    uri: "http://localhost:4000/graphql",
    cache: new InMemoryCache(),
  });
  try {
    // データの取得
client
.query({
  query: gql`
    query GetBooks {
      getBooks {
        id
        title
        author
      }
    }
  `,
})
.then(result => console.log(result.data));

// データの作成
client
.mutate({
  mutation: gql`
    mutation CreateBook($title: String!, $author: String!) {
      createBook(title: $title, author: $author) {
        id
        title
        author
      }
    }
  `,
  variables: {
    title: "GraphQL入門",
    author: "田中 太郎",
  },
})
.then(result => console.log(result.data));

// データの更新
client
.mutate({
  mutation: gql`
    mutation UpdateBook($id: Int!, $title: String, $author: String) {
      updateBook(id: $id, title: $title, author: $author) {
        id
        title
        author
      }
    }
  `,
  variables: {
    id: 1,
    title: "GraphQL基礎",
  },
})
.then(result => console.log(result.data));

// データの削除
client
.mutate({
  mutation: gql`
    mutation DeleteBook($id: Int!) {
      deleteBook(id: $id)
    }
  `,
  variables: {
    id: 1,
  },
})
.then(result => console.log(result.data));
  } catch (error) {
    console.error(error);
  }
}

main();
