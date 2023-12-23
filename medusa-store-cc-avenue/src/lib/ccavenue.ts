import axios, { AxiosInstance } from "axios";
import { encrypt, decrypt } from "../utils/ccavutil";
import { PaymentProcessorContext } from "@medusajs/medusa";
import { CCAvenuePaymentProcessorConfig } from "src/services/ccavenue-payment-processer";
import QueryString from "qs";

const CCAVENUE_API_PATH = "https://secure.ccavenue.com/transaction/transaction.do";

type HTTPMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "HEAD";

interface Request {
    path: string;
    method: HTTPMethod;
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    query?: Record<string, string>;
}


export default class CCavenue {
    private readonly axiosInstance: AxiosInstance;
    private readonly working_key: string;
    private readonly merchant_id: string;
    private readonly access_code: string;
    private readonly redirect_url: string;
    private readonly cancel_url: string;

;
    
    constructor(options:CCAvenuePaymentProcessorConfig) {
        this.working_key = options.working_key;
        this.merchant_id = options.merchant_id;
        this.access_code = options.access_code;
        this.redirect_url = options.redirect_url;
        this.cancel_url = options.cancel_url;
        this.axiosInstance = axios.create({
            baseURL: CCAVENUE_API_PATH,
        });
    }

    public async initiatePaymentRequest<T>(requestData: PaymentProcessorContext): Promise<string> {
        try {
            const requestBody = {
                merchant_id: this.merchant_id,
                order_id: requestData.resource_id,
                currency: requestData.currency_code,
                amount: requestData.amount,
                redirect_url: this.redirect_url,
                cancel_url: this.cancel_url,
                language: "EN", // need to make fetch this from medusa admin settings
                // billing related information
                billing_name: `${requestData.billing_address.first_name} ${requestData.billing_address.last_name}`,
                billing_address: requestData.billing_address.address_1,
                billing_city: requestData.billing_address.city,
                // billing_state: 
                billing_zip: requestData.billing_address.postal_code,
                billing_country: requestData.billing_address.country,
                billing_tel: requestData.billing_address.phone,
                billing_email: requestData.billing_address.customer.email,
                // delivery details
                // currently don't know exactly where to get 
                // delivery_name:
                // delivery_address:
                // delivery_city:
                // delivery_state:
                // delivery_zip:
                // delivery_country:
                // delivery_tel:
                // additional info
                // merchant_param1:
                // merchant_param2:
                // merchant_param3:
                // merchant_param4:
                // merchant_param5:
                integration_type: "iframe_normal",
                //promo_code:
                customer_identifier: requestData.customer.id
            };
            const encRequest = encrypt(requestBody,this.working_key);
            const formBody = '<html><head><title>Sub-merchant checkout page</title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script></head><body><center><!-- width required mininmum 482px --><iframe  width="482" height="500" scrolling="No" frameborder="0"  id="paymentFrame" src="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction&merchant_id='+this.merchant_id+'&encRequest='+encRequest+'&access_code='+this.access_code+'"></iframe></center><script type="text/javascript">$(document).ready(function(){$("iframe#paymentFrame").load(function() {window.addEventListener("message", function(e) {$("#paymentFrame").css("height",e.data["newHeight"]+"px"); }, false);}); });</script></body></html>'
            console.log("this is the formBody which i got from the ccAvenue", formBody);
            return formBody;
        } catch (error) {
            throw new Error(`Error in initiatePaymentRequest: ${error.message}`);
        }
    }
    
    
}
