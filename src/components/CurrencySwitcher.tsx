
import React from 'react';
import { useLanguage, Currency } from '@/contexts/LanguageContext';
import { BadgeDollarSign } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, t } = useLanguage();
  
  const currencies = [
    { code: 'USD', name: t('currency.USD') },
    { code: 'EUR', name: t('currency.EUR') },
    { code: 'MAD', name: t('currency.MAD') }
  ];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-1 p-1 rounded-md hover:bg-muted transition-colors">
        <BadgeDollarSign className="h-5 w-5" />
        <span className="text-sm font-medium">{currency}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            className={`flex items-center gap-2 ${currency === curr.code ? 'font-medium text-primary' : ''}`}
            onClick={() => setCurrency(curr.code as Currency)}
          >
            {curr.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySwitcher;
