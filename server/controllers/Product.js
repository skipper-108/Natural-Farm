import Product from "../models/Product.js";

const postProducts = async (req, res) => {
  const {
    name,
    shortDescription,
    features,
    price,
    currentPrice,
    category,
    images,
    tags,
  } = req.body;

  const mandatoryFields = [
    "name",
    "shortDescription",
    "features",
    "price",
    "category",
    "images",
  ];

  for (const field of mandatoryFields) {
    if (!req.body[field]) {
      return res
        .status(400)
        .json({ success: false, message: `${field} is required` });
    }
  }

  const newProduct = new Product({
    name,
    shortDescription,
    features,
    price,
    currentPrice,
    category,
    images,
    tags,
  });

  try {
    const savedProduct = await newProduct.save();

    return res.json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }

};


const getProducts = async (req, res) => {
    const { limit } = req.query;
    let { search } = req.query;

  search = search ? search.replaceAll("\\", "") : "";

  const products = await Product.find({
    $or: [
      {
        name: {
          $regex: new RegExp(search || ""),
          $options: "i",
        },
      },
      {
        shortDescription: {
          $regex: new RegExp(search || ""),
          $options: "i",
        },
      },
      {
        features: {
          $regex: new RegExp(search || ""),
          $options: "i",
        },
      },
    ],
  }).limit(parseInt(limit || 100));


    return res.json({
        success: true,
        data: products,
        message: "Products fetched successfully",
      });

  };
  
  export { getProducts, postProducts };