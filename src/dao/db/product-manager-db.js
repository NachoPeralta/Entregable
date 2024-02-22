const ProductModel = require("../../models/products.model.js");

class ProductManager {

    async addProduct(newProduct) {
        let { title, description, code, price, status, stock, category, thumbnail } = newProduct;

        if (!title || !description || !code || !price || !stock || !category) {
            console.log("Los datos no pueden estar vacios");
            return;
        }

        const productExist = await ProductModel.findOne({ code: code });
        if (productExist) {
            console.log("El codigo de producto ya existe");
            return;
        }

        const product = new ProductModel({
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnail: thumbnail || []
        })

        await product.save();
        console.log("Producto agregado:", product);
        return product;
    }

    async getProducts(limit, page, query, sort) {
        try {

            let criteria = [];

            // Filtro por categoría si se proporciona en query
            if (query.category) {
                criteria.push({
                    $match: {
                        category: query.category,
                    }
                });
            }

            // Ordenamiento por precio del producto
            const sortOrder = sort === "asc" ? 1 : -1;
            criteria.push({
                $sort: {
                    price: sortOrder,
                }
            });

            // Contar la cantidad total de productos
            const totalProducts = await ProductModel.countDocuments(criteria[0]?.['$match']);

            // Paginación
            criteria.push({
                $skip: (page - 1) * limit,
            }, {
                $limit: limit,
            });

            // Ejecutar la consulta para obtener los productos
            const products = await ProductModel.aggregate(criteria);

            // Calcular las propiedades de paginación
            const totalPages = Math.ceil(totalProducts / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                currentPage: page,
                hasPrevPage,
                hasNextPage,
                docs: products,
            };

        } catch (error) {
            console.log("Error al obtener productos:", error);
            throw error;
        }
    }




    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id);
            
            if (!product) {
                console.log("Producto no encontrado");
                return null;
            }
            return product;
        } catch (error) {
            console.log("Error al obtener producto:", error);
            return error;
        }
    }

    async updateProduct(id, newData) {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(id, newData, { new: true });

            if (!updatedProduct) {
                console.log("Producto no encontrado");
                return null;
            }
            console.log("Producto actualizado:", updatedProduct);
            return updatedProduct;

        } catch (error) {
            console.log("Error al actualizar producto:", error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await ProductModel.findByIdAndDelete(id);

            if (!deletedProduct) {
                console.log("Producto no encontrado");
                return null;
            }
            console.log("Producto eliminado:", deletedProduct);
            return deletedProduct;

        } catch (error) {
            console.log("Error al eliminar producto:", error);
            return null;
        }
    }

}
module.exports = ProductManager;