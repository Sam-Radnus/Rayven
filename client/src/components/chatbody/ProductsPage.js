import React, { useState, useEffect } from 'react'
import "./ProductsPage.css"
import CommonUtil from '../../util/commonUtil'
import axios from 'axios'
const ProductsPage = () => {

    const [modal, setModal] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [products, setProducts] = useState([]);
    const createProduct = async () => {
        console.log(name);
        console.log(price);
        const reader = new FileReader();
        console.log(image);
        reader.readAsDataURL(image);
        reader.onload = async (event) => {
            const imageBase64 = event.target.result;
            console.log(image);
            const response = await axios.post(
                'http://127.0.0.1:8000/api/v1/create_product', {
                'name': name,
                'price': price,
                'image': imageBase64,
                'user_id': CommonUtil.getUserId()
            }
            )
            console.log(response);
        };
        reader.onerror = (event) => {
            console.error(`FileReader error: ${event.target.error}`);
        };
        handleModalClose();
        window.location.reload(); 
    }
    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
        console.log(event.target.files[0]);
    }
    const handleModalOpen = () => {


        setModal(true);
    };

    const handleModalClose = () => {
        setModal(false);
    };
    const getUserDetails = async () => {
        const accessToken = sessionStorage.getItem('access')
        console.warn(CommonUtil.getUserId());
        try {

            console.log(accessToken)
            const response = await axios.post(
                "http://127.0.0.1:8000/api/v1/getUserProfile",
                {

                    'user_id': `${CommonUtil.getUserId()}`

                }
            );

            console.log(response)
            setUserInfo(response?.data?.User)
        } catch (error) {
            console.error(error);
        }
    };
    const getProducts = async () => {

        console.warn(CommonUtil.getUserId());
        try {


            const response = await axios.post(
                "http://127.0.0.1:8000/api/v1/getProducts",
                {

                    'user_id': `${CommonUtil.getUserId()}`

                }
            );

            console.log(response?.data?.products?.products)
            setProducts(response?.data?.products?.products);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(()=>{
       console.log(products);
       getProducts();
    },[products?.length])
    useEffect(() => {
        getUserDetails();
        getProducts();
    }, [userInfo?.id])

    return (
        <div>
            <div>
                <div style={{ position: 'absolute', right: '2%', top: '2%', display: 'flex' }}>
                    <div>
                        {userInfo &&
                            <img src={userInfo.image} className="rounded-circle mr-1"
                                alt={userInfo.username}
                                width="40"
                                height="40" />
                        }
                    </div>
                    <div style={{ marginTop: '5px' }}> <h4>{userInfo.first_name} {userInfo.last_name}</h4></div>
                </div>

            </div>
            <h1 style={{ textAlign: 'center' }}>Products</h1>

            <button style={{ marginLeft: '73vw' }} onClick={handleModalOpen} className="btn btn-primary">Create Product</button>
            <div className={`modal ${modal ? "d-block" : "d-none"}`} id="productModal" tabindex="-1" role="dialog" aria-labelledby="productModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="productModalLabel">Add Product</h5>
                            <button onClick={handleModalClose} type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        {modal && <div class="modal-body">
                            <form>
                                <div class="form-group">
                                    <label for="productName">Name of Product:</label>
                                    <input type="text" value={name} class="form-control" onChange={(e) => {
                                        setName(e.target.value);
                                    }} id="productName" placeholder="Enter product name" />
                                </div>
                                <div class="form-group">
                                    <label for="productPrice">Price of Product:</label>
                                    <input type="number" value={price} class="form-control" onChange={(e) => {
                                        setPrice(e.target.value);
                                    }} id="productPrice" placeholder="Enter product price" />
                                </div>
                                <div class="form-group">
                                    <label for="productImage">Product Image:</label>
                                    <input type="file" class="form-control-file" onChange={handleImageChange} id="productImage" />
                                </div>
                            </form>
                        </div>
                        }
                        <div class="modal-footer">
                            <button type="button" style={{ backgroundColor: "#253851" }} onClick={handleModalClose} class="btn " data-dismiss="modal">Close</button>
                            <button type="button" style={{ backgroundColor: "#253851" }} onClick={createProduct} class="btn ">Add Product</button>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ position: 'absolute', left: '13%' }} class="container d-flex justify-content-center mt-50 mb-50">

                <div class="row">
                    <div class="col-md-10">

                       



                        {products.map((product) => (
                            <div class="card card-body mt-3">
                                <div class="media align-items-center align-items-lg-start text-center text-lg-left flex-column flex-lg-row">
                                    <div class="mr-2 mb-3 mb-lg-0">

                                        <img src={product.image_url} width="150" height="150" alt="" />

                                    </div>

                                    <div class="media-body">
                                        <h6 class="media-title font-weight-semibold">
                                            <a href="#" data-abc="true">{product?.name}</a>
                                        </h6>

                                        <ul class="list-inline list-inline-dotted mb-3 mb-lg-2">
                                            <li class="list-inline-item"><a href="#" class="light" data-abc="true">Phones</a></li>
                                            <li class="list-inline-item"><a href="#" class="light" data-abc="true">Mobiles</a></li>
                                        </ul>

                                        <p class="mb-3">256 GB ROM | 15.49 cm (6.1 inch) Display 12MP Rear Camera | 15MP Front Camera A12 Bionic Chip Processor | Gorilla Glass with high quality display </p>

                                        <ul class="list-inline list-inline-dotted mb-0">
                                            <li class="list-inline-item">All items from <a href="#" data-abc="true">Mobile junction</a></li>
                                            <li class="list-inline-item">Add to <a href="#" data-abc="true">wishlist</a></li>
                                        </ul>
                                    </div>

                                    <div class="mt-3 mt-lg-0 ml-lg-3 text-center">
                                        <h3 class="mb-0 font-weight-semibold">${product.price}</h3>

                                        <div>
                                            <i class="fa fa-star"></i>
                                            <i class="fa fa-star"></i>
                                            <i class="fa fa-star"></i>
                                            <i class="fa fa-star"></i>
                                            <i class="fa fa-star"></i>

                                        </div>

                                        <div class="light">2349 reviews</div>

                                        <button type="button" class="btn btn-warning mt-4 text-white"><i class="icon-cart-add mr-2"></i> Add to cart</button>
                                    </div>
                                </div>
                            </div>
                        ))}



                       



                    </div>
                </div>
            </div>

        </div>
    )
}

export default ProductsPage