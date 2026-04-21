import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MenuItemRow from './MenuItemRow'
import type { MenuItem } from '../../types'

const mockItem: MenuItem = {
  id: '1',
  category: 'appetizer',
  name: '星芒沙拉',
  description: '清爽的季節蔬菜',
  price: 100,
  imageUrl: '',
  available: true,
  order: 0,
}

describe('MenuItemRow', () => {
  it('顯示品項名稱、描述與價格', () => {
    render(<MenuItemRow item={mockItem} />)
    expect(screen.getByText('星芒沙拉')).toBeInTheDocument()
    expect(screen.getByText('清爽的季節蔬菜')).toBeInTheDocument()
    expect(screen.getByText('100 gil')).toBeInTheDocument()
  })

  it('供應中時顯示供應中徽章', () => {
    render(<MenuItemRow item={mockItem} />)
    expect(screen.getByText('供應中')).toBeInTheDocument()
  })

  it('售完時顯示已售完徽章且列為半透明', () => {
    render(<MenuItemRow item={{ ...mockItem, available: false }} />)
    expect(screen.getByText('已售完')).toBeInTheDocument()
    const row = screen.getByRole('listitem')
    expect(row).toHaveClass('opacity-50')
  })

  it('當存在別名 (alias) 時，優先顯示別名', () => {
    const itemWithAlias = { ...mockItem, alias: '別名標題' }
    render(<MenuItemRow item={itemWithAlias} />)
    expect(screen.getByText('別名標題')).toBeInTheDocument()
    expect(screen.queryByText('星芒沙拉')).not.toBeInTheDocument()
  })
})
