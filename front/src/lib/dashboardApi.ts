import { supabase } from './supabaseClient';
import type {
  SalesStats,
  RepairStats,
  RevenueData,
  StockAlert,
  DashboardData,
  RepairRequest
} from './types';

// Get total sales statistics
export async function getSalesStats(): Promise<SalesStats> {
  try {
    // Get total orders count and revenue
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .not('total_amount', 'is', null);

    if (ordersError) throw ordersError;

    const orders = ordersData || [];
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalSales,
      totalRevenue,
      averageOrderValue
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    // Return mock data if there's an error
    return {
      totalSales: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };
  }
}

// Get repair statistics
export async function getRepairStats(): Promise<RepairStats> {
  try {
    // Get repair requests from orders with repair status
    const { data: repairData, error: repairError } = await supabase
      .from('orders')
      .select('id, created_at, status')
      .eq('type', 'repair');

    if (repairError) throw repairError;

    const repairs = repairData || [];
    const totalRequests = repairs.length;

    // Count by status
    const pendingRequests = repairs.filter(r => r.status === 'pending').length;
    const inProgressRequests = repairs.filter(r => r.status === 'in_progress').length;
    const completedRequests = repairs.filter(r => r.status === 'completed').length;

    // Get data over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: timeData, error: timeError } = await supabase
      .from('orders')
      .select('created_at, status')
      .eq('type', 'repair')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (timeError) throw timeError;

    const requestsOverTime = processRepairDataOverTime(timeData || []);

    return {
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      requestsOverTime
    };
  } catch (error) {
    console.error('Error fetching repair stats:', error);
    // Return mock data
    return {
      totalRequests: 0,
      pendingRequests: 0,
      inProgressRequests: 0,
      completedRequests: 0,
      requestsOverTime: []
    };
  }
}

// Helper function to process repair data over time
function processRepairDataOverTime(data: any[]): Array<{
  date: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}> {
  const dailyData: { [key: string]: { total: number; pending: number; inProgress: number; completed: number } } = {};

  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }
    dailyData[date].total++;
    if (item.status === 'pending') dailyData[date].pending++;
    if (item.status === 'in_progress') dailyData[date].inProgress++;
    if (item.status === 'completed') dailyData[date].completed++;
  });

  return Object.entries(dailyData).map(([date, counts]) => ({
    date,
    ...counts
  }));
}

// Get revenue data for charts
export async function getRevenueData(): Promise<RevenueData> {
  try {
    // Get weekly revenue data (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const { data: weeklyData, error: weeklyError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', eightWeeksAgo.toISOString())
      .not('total_amount', 'is', null);

    if (weeklyError) throw weeklyError;

    const weekly = processRevenueByWeek(weeklyData || []);

    // Get daily revenue data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: dailyData, error: dailyError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('total_amount', 'is', null);

    if (dailyError) throw dailyError;

    const daily = processRevenueByDay(dailyData || []);

    return {
      daily,
      weekly,
      monthly: [] // Could be implemented later
    };
  } catch (error) {
    // Return mock data
    return {
      daily: [],
      weekly: [],
      monthly: []
    };
  }
}

// Helper function to process revenue by day
function processRevenueByDay(data: any[]): Array<{ date: string; revenue: number; orders: number }> {
  const dailyData: { [key: string]: { revenue: number; orders: number } } = {};

  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { revenue: 0, orders: 0 };
    }
    dailyData[date].revenue += item.total_amount || 0;
    dailyData[date].orders++;
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data
  }));
}

// Helper function to process revenue by week
function processRevenueByWeek(data: any[]): Array<{ week: string; revenue: number; orders: number }> {
  const weeklyData: { [key: string]: { revenue: number; orders: number } } = {};

  data.forEach(item => {
    const date = new Date(item.created_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { revenue: 0, orders: 0 };
    }
    weeklyData[weekKey].revenue += item.total_amount || 0;
    weeklyData[weekKey].orders++;
  });

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    ...data
  }));
}

// Get stock alerts for products with low inventory
export async function getStockAlerts(): Promise<StockAlert[]> {
  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        size,
        color,
        stock,
        product_id,
        products (
          id,
          title
        )
      `);

    if (error) throw error;

    const alerts: StockAlert[] = [];

    (variants || []).forEach(variant => {
      const stock = variant.stock || 0;
      if (stock <= 5) {
        // Handle the case where products might be an array or an object
        const productTitle = Array.isArray(variant.products)
          ? (variant.products[0] as any)?.title || 'Unknown Product'
          : (variant.products as any)?.title || 'Unknown Product';

        alerts.push({
          productId: variant.product_id,
          productName: productTitle,
          variantId: variant.id,
          variantName: `Size ${variant.size}, ${variant.color}`,
          currentStock: stock,
          alertLevel: stock <= 2 ? 'critical' : 'low',
          suggestedReorder: Math.max(10 - stock, 5)
        });
      }
    });

    return alerts;
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return [];
  }
}

// Get all dashboard data
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [sales, repairs, revenue, stockAlerts] = await Promise.all([
      getSalesStats(),
      getRepairStats(),
      getRevenueData(),
      getStockAlerts()
    ]);

    return {
      sales,
      repairs,
      revenue,
      stockAlerts,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return mock data structure
    return {
      sales: { totalSales: 0, totalRevenue: 0, averageOrderValue: 0 },
      repairs: {
        totalRequests: 0,
        pendingRequests: 0,
        inProgressRequests: 0,
        completedRequests: 0,
        requestsOverTime: []
      },
      revenue: { daily: [], weekly: [], monthly: [] },
      stockAlerts: [],
      lastUpdated: new Date().toISOString()
    };
  }
}
