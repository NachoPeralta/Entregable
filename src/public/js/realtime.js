const socket = io();

const deleteProduct = (id) => {
    socket.emit("deleteProduct", id);
    location.reload();
}

const addProduct = () => {
    
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true"
    };

    socket.emit("addProduct", product);
    location.reload();
};
