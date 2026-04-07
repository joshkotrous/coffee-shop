import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  requireAdmin,
  AuthenticationError,
  AuthorizationError,
  MalformedAuthHeaderError,
} from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let sqlQuery = "SELECT * FROM products";

    if (search) {
      sqlQuery += ` WHERE ${search}`;
    }

    sqlQuery += " ORDER BY image_url IS NOT NULL DESC, created_at DESC";

    const result = await query(sqlQuery);

    // Convert price strings to numbers
    const products =
      result?.rows?.map((product) => ({
        ...product,
        price: parseFloat(product.price),
      })) || [];

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const { name, description, price, image_url, stock_quantity } =
      await request.json();

    const result = await query(
      "INSERT INTO products (name, description, price, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, description, price, image_url, stock_quantity || 0]
    );

    return NextResponse.json(result?.rows?.[0]);
  } catch (error) {
    // Handle malformed auth headers (400 Bad Request)
    if (error instanceof MalformedAuthHeaderError) {
      console.warn("Malformed Authorization header:", error.message);
      return NextResponse.json(
        { error: "Bad Request: Invalid Authorization header" },
        { status: 400 }
      );
    }

    // Handle authentication errors (401)
    if (error instanceof AuthenticationError) {
      console.warn("Authentication failed:", error.message);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: error.statusCode || 401 }
      );
    }

    // Handle authorization errors (403)
    if (error instanceof AuthorizationError) {
      console.warn("Authorization failed:", error.message);
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
