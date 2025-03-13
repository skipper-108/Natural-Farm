import {model, Schema} from "mongoose"; 

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    features: {
        type: [String],
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    currentPrice: {
        type: String,
    },
    category: {
        type: String,
        required: true,
    },
    images: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
    },
}, {
    timestamps: true,
});

const Product = model("Product", productSchema);

export default Product;