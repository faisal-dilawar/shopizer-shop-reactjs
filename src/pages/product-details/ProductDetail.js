import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import MetaTags from "react-meta-tags";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { connect } from "react-redux";
import Layout from "../../layouts/Layout";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";
// import RelatedProductSlider from "../../wrappers/product/RelatedProductSlider";
import ProductDescriptionTab from "../../wrappers/product/ProductDescriptionTab";
import ProductImageDescription from "../../wrappers/product/ProductImageDescription";
import WebService from '../../util/webService';
import constant from '../../util/constant';
import { setLoader } from "../../redux/actions/loaderActions";
import { multilanguage } from "redux-multilanguage";
const ProductDetails = ({ strings, location, match, currentLanguageCode, setLoader, defaultStore }) => {
  const { pathname } = location;
  const productID = (match && match.params && match.params.id) ? match.params.id : pathname.split('/').pop();
  const [productDetails, setProductDetails] = useState();
  const [productReview, setProductReview] = useState([]);

  useEffect(() => {
    if (productID) {
      getProductDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productID, currentLanguageCode]);

  useEffect(() => {
    if (productDetails && productDetails.id) {
      getReview(productDetails.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDetails]);

  const getProductDetails = async () => {
    setLoader(true)
    // Use the friendly URL endpoint
    let action = 'product/friendly/' + productID + '?lang=' + currentLanguageCode + '&store=' + defaultStore;
    try {
      let response = await WebService.get(action);
      if (response) {
        setProductDetails(response)
      }
      setLoader(false)
    } catch (error) {
      console.error("Error fetching product details:", error);
      setLoader(false)
    }
  }
  const getReview = async (id) => {
    let action = constant.ACTION.PRODUCT + id + '/reviews?store=' + defaultStore;
    try {
      let response = await WebService.get(action);
      if (response) {
        setProductReview(response)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }
  
  if (!productDetails && !strings) {
      return null;
  }

  return (
    <Fragment>
      <MetaTags>
        <title>{productDetails ? productDetails.description.title : (strings ? strings["Product Details"] : "Product")}</title>
        <meta
          name="description"
          content={productDetails ? productDetails.description.metaDescription : ""}
        />
      </MetaTags>

      <BreadcrumbsItem to={process.env.PUBLIC_URL + "/"}>{strings ? strings["Home"] : "Home"}</BreadcrumbsItem>
      <BreadcrumbsItem to={process.env.PUBLIC_URL + pathname}>
        {productDetails ? productDetails.description.name : ""}
      </BreadcrumbsItem>

      <Layout headerContainerClass="container-fluid"
        headerPaddingClass="header-padding-2"
        headerTop="visible">
        {/* breadcrumb */}
        <Breadcrumb />

        {/* product description with image */}
        {
          productDetails ?
          <ProductImageDescription
            spaceTopClass="pt-100"
            spaceBottomClass="pb-100"
            strings={strings}
            product={productDetails}
          />
          : <div className="pt-100 pb-100 text-center">{strings ? strings["Loading..."] : "Loading..."}</div>
        }


        {/* product description tab */}
        {
          productDetails &&
          <ProductDescriptionTab
            spaceBottomClass="pb-90"
            strings={strings}
            product={productDetails}
            review={productReview}
          />
        }
      </Layout>
    </Fragment>
  );
};

ProductDetails.propTypes = {
  location: PropTypes.object,
  match: PropTypes.object,
  currentLanguageCode: PropTypes.string,
};

const mapStateToProps = (state, ownProps) => {
  // const itemId = ownProps.match.params.id;
  return {
    currentLanguageCode: state.multilanguage ? state.multilanguage.currentLanguageCode : 'en',
    defaultStore: state.merchantData ? state.merchantData.defaultStore : 'DEFAULT'
  };
};
const mapDispatchToProps = dispatch => {
  return {
    setLoader: (value) => {
      dispatch(setLoader(value));
    }
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(multilanguage(ProductDetails));
