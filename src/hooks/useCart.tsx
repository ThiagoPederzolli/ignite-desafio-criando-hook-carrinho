import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const haveProductInCart = cart.find((cartProductId) => cartProductId.id === productId);
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)
      
      if (!haveProductInCart) {
        const {data: product} = await api.get<Product>(`products/${productId}`);
        const addProductInCart = {...product, amount: 1}
        if (addProductInCart.amount <= stock.amount) {
          setCart([...cart, addProductInCart]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, addProductInCart]))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      } else {
        if (haveProductInCart.amount < stock.amount) {
          const amountOfProduct = haveProductInCart.amount;
          await setCart([...cart.filter((cartId) => cartId.id !== haveProductInCart.id), {...haveProductInCart, amount: amountOfProduct + 1}]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart.filter((cartId) => cartId.id !== haveProductInCart.id), {...haveProductInCart, amount: amountOfProduct + 1}]))
        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const removingProduct = cart.find((product: Product) => product.id ===  productId)
        if (!removingProduct) {
          toast.error('Erro na remoção do produto');
          return;
        } else {
          setCart([...cart.filter((cartId) => cartId.id !== removingProduct.id)]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart.filter((cartId) => cartId.id !== removingProduct.id)]))
        }
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const {data: stock} = await api.get<Stock>(`stock/${productId}`)

      // TODO
      const updateAmount = cart.find((product: Product) => product.id ===  productId)
      if (updateAmount && amount < 1) {        
        return;
      }
      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      if (updateAmount) {
        setCart([...cart.filter((cartId) => cartId.id !== updateAmount.id), {...updateAmount, amount}]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart.filter((cartId) => cartId.id !== updateAmount.id), {...updateAmount, amount}]))
      }
      
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}


    // }
      // const addingProduct = response.data.find((product: Product) => product.id ===  productId)
      // const haveProductInCart = cart.find((cartProductId) => cartProductId.id === addingProduct.id);
      // if (!haveProductInCart) {
      //   setCart([...cart, {...addingProduct, amount: 1}]);
      //   localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      // } else {
      //   const productInStock = stock.find((stockId) => stockId.id === productId);
      //   if (productInStock &&  haveProductInCart.amount >= productInStock?.amount) {
      //     toast.error('Quantidade solicitada fora de estoque');
      //     return;
      //   } else {
      //     const amountOfProduct = haveProductInCart.amount;
      //     setCart([...cart.filter((cartId) => cartId.id !== addingProduct.id), {...addingProduct, amount: amountOfProduct + 1}]);
      //     localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
      //   }