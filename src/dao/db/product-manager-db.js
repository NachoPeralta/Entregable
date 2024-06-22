const ProductModel = require("../../models/products.model.js");
const logger = require("../../service/logs/logger.js");

class ProductManager {

    async addProduct(newProduct) {
        let { title, description, code, price, status, stock, category, thumbnail, owner } = newProduct;

        if (!title || !description || !code || !price || !stock || !category) {
            logger.warning("Los datos no pueden estar vacios");
            return;
        }

        const productExist = await ProductModel.findOne({ code: code });
        if (productExist) {
            logger.error("El codigo de producto ya existe");
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
            thumbnail: thumbnail || [],
            owner
        })

        await product.save();
        logger.info("Producto agregado:", product);
        return product;
    }

    async getProducts(limit = 10, page = 1, category, sort, owner) {
    
        try {

            let criteria = [];

            // Filtro por categoría si se proporciona en query
            if (category) {
                criteria.push({
                    $match: {
                        category: category,
                    }
                });
            }
            //Filtro por User Owner
            if (owner !== "admin") {
                criteria.push({
                    $match: {
                        owner: owner,
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
            page = parseInt(page);
            limit = parseInt(limit);
            if (isNaN(page) || isNaN(limit)) {
                throw new Error("La página y el límite deben ser números válidos.");
            }

            // Paginación
            const skipCount = (page - 1) * limit;
            criteria.push({
                $skip: skipCount,
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
            logger.error("Error al obtener productos:", error);
            throw error;
        }
    }




    async getProductById(id) {
        try {
            
            const product = await ProductModel.findById(id);

            if (!product) {
                logger.warning("Producto no encontrado");
                return null;
            }
            return product;
        } catch (error) {
            logger.error("Error al obtener producto:", error);
            return error;
        }
    }

    async updateProduct(id, newData) {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(id, newData, { new: true });

            if (!updatedProduct) {
                logger.warning("Producto no encontrado");
                return null;
            }
            logger.info("Producto actualizado:", updatedProduct);
            return updatedProduct;

        } catch (error) {
            logger.error("Error al actualizar producto:", error);
            return null;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await ProductModel.findByIdAndDelete(id);

            if (!deletedProduct) {
                logger.warning("Producto no encontrado");
                return null;
            }
            logger.info("Producto eliminado:", deletedProduct);
            return deletedProduct;

        } catch (error) {
            logger.error("Error al eliminar producto:", error);
            return null;
        }
    }

}
module.exports = ProductManager;