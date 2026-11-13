import { createContext,useContext,useEffect,useMemo,useState } from 'react';
const Ctx=createContext(null);
export function CartProvider({children}){
 const [cart,setCart]=useState(()=>JSON.parse(localStorage.getItem('family-cart')||'[]'));
 useEffect(()=>localStorage.setItem('family-cart',JSON.stringify(cart)),[cart]);
 const add=(p)=>setCart(old=>{const found=old.find(x=>x._id===p._id);return found?old.map(x=>x._id===p._id?{...x,quantity:x.quantity+1}:x):[...old,{...p,quantity:1}]});
 const change=(id,quantity)=>setCart(old=>old.map(x=>x._id===id?{...x,quantity:Math.max(1,quantity)}:x));
 const remove=id=>setCart(old=>old.filter(x=>x._id!==id));
 const clear=()=>setCart([]);
 const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);
 const value=useMemo(()=>({cart,add,change,remove,clear,total,count:cart.reduce((s,x)=>s+x.quantity,0)}),[cart,total]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCart=()=>useContext(Ctx);
