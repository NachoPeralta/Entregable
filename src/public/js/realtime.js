const socket = io();

const deleteProduct = (pid) => {
    socket.emit("deleteProduct", pid);
    location.reload();
}

const addProduct = (owner) => {

    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        code: document.getElementById("code").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value,
        status: document.getElementById("status").value === "true",
        owner: owner
    };

    socket.emit("addProduct", product);
    location.reload(); 
};


