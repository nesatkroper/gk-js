import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request) {
  try {
    const { type, format, filters } = await request.json()

    let data = []
    let filename = ""
    let headers = []

    switch (type) {
      case "sales":
        const sales = await prisma.sale.findMany({
          where: filters,
          include: {
            Customer: true,
            Employee: true,
            Saledetail: {
              include: {
                Product: true,
              },
            },
          },
          orderBy: { saleDate: "desc" },
        })

        data = sales.map((sale) => ({
          Invoice: sale.invoice || "",
          Date: sale.saleDate.toLocaleDateString(),
          Customer: `${sale.Customer.firstName} ${sale.Customer.lastName}`,
          Employee: `${sale.Employee.firstName} ${sale.Employee.lastName}`,
          Items: sale.Saledetail.length,
          Amount: sale.amount,
          Status: sale.status,
        }))

        headers = ["Invoice", "Date", "Customer", "Employee", "Items", "Amount", "Status"]
        filename = `sales-report-${new Date().toISOString().split("T")[0]}`
        break

      case "inventory":
        const inventory = await prisma.product.findMany()

        data = inventory.map((product) => ({
          "Product Code": product.productCode || "",
          "Product Name": product.productName,
          "Category": product.Category.categoryName,
          "Current Stock": product.quantity,
          "Unit": product.unit || "",
          "Cost Price": product.costPrice,
          "Sell Price": product.sellPrice,
          "Stock Value": product.quantity * product.costPrice,
        }))

        headers = [
          "Product Code",
          "Product Name",
          "Category",
          "Current Stock",
          "Unit",
          "Cost Price",
          "Sell Price",
          "Stock Value",
        ]
        filename = `inventory-report-${new Date().toISOString().split("T")[0]}`
        break

      case "customers":
        const customers = await prisma.customer.findMany({
          where: { status: "active" },
          include: {
            info: true,
            _count: {
              select: { Sale: true },
            },
          },
        })

        data = customers.map((customer) => ({
          "First Name": customer.firstName,
          "Last Name": customer.lastName,
          Phone: customer.phone || "",
          Email: customer.CustomerInfo?.email || "",
          Gender: customer.gender,
          "Total Sales": customer._count.sales,
          "Joined Date": customer.createdAt.toLocaleDateString(),
        }))

        headers = ["First Name", "Last Name", "Phone", "Email", "Gender", "Total Sales", "Joined Date"]
        filename = `customers-report-${new Date().toISOString().split("T")[0]}`
        break

      case "employees":
        const employees = await prisma.employee.findMany({
          where: { status: "active" },
          include: {
            department: true,
            position: true,
            info: true,
            _count: {
              select: { sales: true },
            },
          },
        })

        data = employees.map((employee) => ({
          "Employee Code": employee.employeeCode || "",
          "First Name": employee.firstName,
          "Last Name": employee.lastName,
          Department: employee.Department.departmentName,
          Position: employee.Position.positionName,
          Phone: employee.phone || "",
          Email: employee.EmployeeInfo?.email || "",
          Salary: employee.salary,
          "Total Sales": employee._count.sales,
          "Hired Date": employee.hiredDate?.toLocaleDateString() || "",
        }))

        headers = [
          "Employee Code",
          "First Name",
          "Last Name",
          "Department",
          "Position",
          "Phone",
          "Email",
          "Salary",
          "Total Sales",
          "Hired Date",
        ]
        filename = `employees-report-${new Date().toISOString().split("T")[0]}`
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    // For JSON format or other processing
    return NextResponse.json({
      data,
      headers,
      filename,
      total: data.length,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
