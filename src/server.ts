import "reflect-metadata";
import { ApolloServer, type ServerRegistration } from "apollo-server-express";
import express, { type Application } from "express";
import {
	Arg,
	Field,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	buildSchema,
} from "type-graphql";

// TypeORM使った場合のEntityと型定義一緒にやる方法
// https://github.com/MichalLytek/type-graphql/blob/v2.0.0-rc.2/examples/typeorm-basic-usage/entities/user.ts
// 今回はTypeORM使わないので、ここでGraphQLの型定義を行う。
@ObjectType()
class Book {
	@Field()
	id: number;
	@Field()
	title: string;
	@Field()
	author: string;

	// コンストラクタで必ず初期化して値が入ってくるようにする。
	constructor(id: number, title: string, author: string) {
		this.id = id;
		this.title = title;
		this.author = author;
	}
}
// Resolverでクエリやミューテーションを定義する。
// 今回はBook型のクエリやミューテーションを定義する。
// デコレーターを使っているので、GraphQLのスキーマが自動生成される。
// 今回は、getBooks, createBook, updateBook, deleteBookのクエリやミューテーションを定義する。
@Resolver(Book)
class BookResolver {
	// 擬似的なDBとして、private books: Book[] = [];を定義する。
	// DBとつなぎこむ場合は、ここでDBとの接続を行う。
	private books: Book[] = [];

	@Query(() => [Book])
	getBooks(): Book[] {
		return this.books;
	}

	@Mutation(() => Book)
	createBook(@Arg("title") title: string, @Arg("author") author: string): Book {
		const book = new Book(this.books.length + 1, title, author);
		this.books.push(book);
		return book;
	}

	// idが必要とする。
	// idに合致する本がない場合はnullを返す。
	@Mutation(() => Book, { nullable: true })
	updateBook(
		@Arg("id", () => Int) id: number,
		@Arg("title", () => String, { nullable: true }) title?: string,
		@Arg("author", () => String, { nullable: true }) author?: string,
	): Book | null {
		const book = this.books.find((book) => book.id === id);
		if (!book) return null;
		if (title) book.title = title;
		if (author) book.author = author;
		return book;
	}

	@Mutation(() => Boolean)
	deleteBook(@Arg("id", () => Int) id: number): boolean {
		const bookIndex = this.books.findIndex((book) => book.id === id);
		if (bookIndex === -1) return false;
		this.books.splice(bookIndex, 1);
		return true;
	}
}

async function main() {
	const schema = await buildSchema({
		resolvers: [BookResolver],
	});

	const server = new ApolloServer({ schema });
	const app = express();
	await server.start();
	server.applyMiddleware({ app } as ServerRegistration);

	app.listen(4000, () => {
		console.log("Server is running on http://localhost:4000/graphql");
	});
}

main();
