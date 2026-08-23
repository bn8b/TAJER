insert into public.assets(symbol,name,category,sort_order) values
('XAU/USD','Gold','Forex/Metal',1),('EUR/USD','Euro / US Dollar','Forex',2),('GBP/USD','British Pound / US Dollar','Forex',3),('USD/JPY','US Dollar / Japanese Yen','Forex',4),('BTC/USD','Bitcoin / US Dollar','Crypto',5)
on conflict(symbol) do nothing;
insert into public.app_settings(key,value) values
('subscription_price','5'),('subscription_days','30'),('payment_currency','USDT'),('payment_network','TRC20'),('payment_wallet','CHANGE_ME'),('app_name','TAJER'),('maintenance_mode','false')
on conflict(key) do nothing;
