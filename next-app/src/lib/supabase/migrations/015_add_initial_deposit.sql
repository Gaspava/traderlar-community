-- Add Initial Deposit and Total Return Percentage fields to trading_strategies table
ALTER TABLE trading_strategies 
ADD COLUMN IF NOT EXISTS initial_deposit DECIMAL(20,2),
ADD COLUMN IF NOT EXISTS total_return_percentage DECIMAL(20,2);

-- Update existing strategies to calculate total_return_percentage based on initial_deposit
UPDATE trading_strategies 
SET total_return_percentage = (total_net_profit / NULLIF(initial_deposit, 0)) * 100
WHERE initial_deposit IS NOT NULL AND initial_deposit > 0;

-- Add comment for clarity
COMMENT ON COLUMN trading_strategies.initial_deposit IS 'Initial deposit amount from the backtest report';
COMMENT ON COLUMN trading_strategies.total_return_percentage IS 'Total return percentage calculated as (total_net_profit / initial_deposit) * 100';