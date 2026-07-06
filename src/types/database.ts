// Tipos do domínio + tipagem mínima para o supabase-js.

export type Condition = 'novo' | 'usado' | 'seminovo'
export type MovementType = 'entrada' | 'saida' | 'venda' | 'ajuste'

export type Supplier = {
  id: string
  name: string
  contact: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  platform: string | null
  category: string | null
  condition: Condition
  description: string | null
  image_url: string | null
  cost_price: number
  sale_price: number
  quantity: number
  min_stock: number
  supplier_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type StockMovement = {
  id: string
  product_id: string
  type: MovementType
  quantity: number
  unit_price: number
  note: string | null
  created_by: string | null
  created_at: string
}

// Payloads de escrita (sem colunas geradas pelo banco)
export type SupplierInput = Omit<Supplier, 'id' | 'created_at'>
export type ProductInput = Omit<
  Product,
  'id' | 'created_at' | 'updated_at' | 'quantity'
>
export type MovementInput = Omit<
  StockMovement,
  'id' | 'created_at' | 'created_by'
>

// Tipagem mínima exigida por createClient<Database>
export type Database = {
  public: {
    Tables: {
      suppliers: {
        Row: Supplier
        Insert: SupplierInput
        Update: Partial<SupplierInput>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: ProductInput
        Update: Partial<ProductInput>
        Relationships: [
          {
            foreignKeyName: 'products_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
        ]
      }
      stock_movements: {
        Row: StockMovement
        Insert: MovementInput
        Update: Partial<MovementInput>
        Relationships: [
          {
            foreignKeyName: 'stock_movements_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
