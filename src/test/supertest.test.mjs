import supertest from "supertest";
import { expect } from "chai";

const requester = supertest("http://localhost:8080");
let productId = "";
let cartId = "";
let authToken = "";

// TESTING DE PRODUCTOS
describe(" ** TESTING DE PRODUCTOS ** ", () => {
    // Test para agregar un producto
    describe("POST - /api/products", () => {
        it("Deberia retornar un 201", async () => {
            const newProduct = {
                title: "Producto creado desde modulo de Testing",
                description: "Este es un producto creado desde modulo de Testing",
                code: "Test1",
                price: 5000,
                status: true,
                stock: 25,
                category: "T1",
                thumbnail: []
            };

            const { statusCode, ok, body } = await requester.post("/api/products").send(newProduct);

            // Imprimir la respuesta del servidor
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(201); // Verifica que el código de estado es 201

            expect(body.product).to.have.property("newProduct");
            productId = body.product.newProduct._id;

            console.log("productId: " + productId);
        });
    });

    // Test para obtener un producto por su ID
    describe("GET - /api/products/:pid", () => {
        it("Deberia retornar un 200 y el producto correspondiente", async () => {
            if (productId === "") {
                console.log("No se encontro productId");
                return;
            }

            const { statusCode, body } = await requester.get(`/api/products/${productId}`);
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(200);
            expect(body).to.have.property("product");
            expect(body.product).to.have.property("_id");
            expect(body.product._id).to.equal(productId);
        });
    });

    // Test para eliminar un producto
    describe("DELETE - /api/products/:pId", () => {
        it("Deberia retornar un 200", async () => {
            if (productId === "") {
                console.log("No se encontro productId");
                return;
            }

            const { statusCode, body } = await requester.delete(`/api/products/${productId}`);
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(200);
            expect(body).to.have.property("deletedProduct");
            expect(body.deletedProduct).to.have.property("_id");
            expect(body.deletedProduct._id).to.equal(productId);
        });
    });
});

// TESTING DE CARRITOS
describe(" ** TESTING DE CARRITOS ** ", () => {
    // Test para obtener todos los carritos
    describe("GET - /api/carts", () => {
        it("Deberia retornar un 200 y una lista de carritos", async () => {
            const { statusCode, body } = await requester.get("/api/carts");
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(200);
            expect(body).to.have.property("status").eql("success");
            expect(body.cart).to.be.a("array");
        });
    });

    // Test para crear un carrito
    describe("POST - /api/carts", () => {
        it("Deberia retornar un 201", async () => {
            const { statusCode, body } = await requester.post("/api/carts");
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(201);
            expect(body).to.have.property("status").eql("Success");
            expect(body).to.have.property("cart");
            expect(body.cart).to.have.property("_id");
            cartId = body.cart._id;
        });
    });

    // Test para eliminar el carrito creado
    describe("DELETE - /api/carts/:cid", () => {
        it("Deberia retornar un 200", async () => {
            if (cartId === "") {
                console.log("No se encontro cartId");
                return;
            }

            const { statusCode, body } = await requester.delete(`/api/carts/${cartId}`);
            console.log("Respuesta del servidor:", statusCode, body);

            expect(statusCode).to.equal(200);
            expect(body).to.have.property("status").eql("Success");
        });
    });
});

// TESTING DE USUARIOS
describe("TESTING DE USUARIOS", () => {
    // Test para registrar un usuario
    describe("POST - /api/users/register", () => {
        it("Deberia registrar un usuario y retornar un 302 (redireccion)", async () => {
            const newUser = {
                first_name: "Test",
                last_name: "User",
                email: "testuser@example.com",
                password: "password123",
                age: 30
            };

            const { statusCode, header, body } = await requester.post("/api/users/register").send(newUser);
            console.log("Respuesta del servidor:", statusCode, header);

            expect(statusCode).to.equal(302); // Verifica que el código de estado es 302
            expect(header).to.have.property("location").that.includes("/api/users/profile");
        });
    });

    // Test para login de usuario
    describe("POST - /api/users/login", () => {
        it("Deberia iniciar sesion y retornar un 302 (redireccion)", async () => {
            const credentials = {
                email: "testuser@example.com",
                password: "password123"
            };

            const { statusCode, header } = await requester.post("/api/users/login").send(credentials);
            console.log("Respuesta del servidor:", statusCode, header);

            expect(statusCode).to.equal(302); // Verifica que el código de estado es 302
            expect(header).to.have.property("location").that.includes("/api/users/profile");

            // Extraer el token de autenticación de las cookies de la respuesta de redirección
            const cookies = header["set-cookie"];
            if (!cookies) {
                console.error("No se encontraron cookies en la respuesta de redireccionamiento:", header);
                throw new Error("No se encontraron cookies en la respuesta de redireccionamiento");
            }
            const tokenCookie = cookies.find(cookie => cookie.startsWith("coderCookieToken="));
            if (!tokenCookie) {
                console.error("No se encontró la cookie del token de autenticación en la respuesta de redireccionamiento:", cookies);
                throw new Error("No se encontró la cookie del token de autenticación en la respuesta de redireccionamiento");
            }
            authToken = tokenCookie.split(";")[0].split("=")[1];
            console.log("Token de autenticación:", authToken);
        });
    });

    // Test para logout de usuario
    describe("POST - /api/users/logout", () => {
        it("Deberia cerrar la sesion del usuario y retornar un 302 (redireccion)", async () => {
            // Utilizar el token de autenticación para realizar la solicitud de logout
            const { statusCode, header } = await requester.post("/api/users/logout").set("Cookie", [`coderCookieToken=${authToken}`]);
            console.log("Respuesta del servidor:", statusCode, header);

            expect(statusCode).to.equal(302); // Verifica que el código de estado es 302
            expect(header).to.have.property("location").that.includes("/");

            // Limpiar el authToken después de cerrar sesión
            authToken = "";
        });
    });
});
