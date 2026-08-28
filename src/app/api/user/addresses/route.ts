import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { User, IAddress } from '@/models/User';

// GET: Fetch all saved addresses of the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('addresses').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching addresses:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// POST: Add a new address to the user's addresses array
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phoneNumber, streetAddress, city, state, pincode, isDefault } = body;

    // Validation
    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, error: 'All address fields are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    // Initialize addresses list if empty
    if (!user.addresses) {
      user.addresses = [];
    }

    // Determine if this should be default (if first address, make it default anyway)
    const shouldBeDefault = user.addresses.length === 0 ? true : !!isDefault;

    if (shouldBeDefault) {
      // Set all other addresses' isDefault to false
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress: Omit<IAddress, '_id'> = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddress as IAddress);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address added successfully!',
      addresses: user.addresses,
    });
  } catch (error: unknown) {
    console.error('Error adding address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT: Update an existing address in the user's addresses array
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _id, fullName, phoneNumber, streetAddress, city, state, pincode, isDefault } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required.' },
        { status: 400 }
      );
    }

    // Validation
    if (!fullName || !phoneNumber || !streetAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, error: 'All address fields are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.addresses) {
      return NextResponse.json(
        { success: false, error: 'Address not found.' },
        { status: 404 }
      );
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id && addr._id.toString() === _id
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized.' },
        { status: 404 }
      );
    }

    // Handle isDefault logic
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses[addressIndex].fullName = fullName.trim();
    user.addresses[addressIndex].phoneNumber = phoneNumber.trim();
    user.addresses[addressIndex].streetAddress = streetAddress.trim();
    user.addresses[addressIndex].city = city.trim();
    user.addresses[addressIndex].state = state.trim();
    user.addresses[addressIndex].pincode = pincode.trim();
    user.addresses[addressIndex].isDefault = !!isDefault;

    // Double check that at least one address remains default if addresses exist
    const hasDefault = user.addresses.some((addr) => addr.isDefault);
    if (!hasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully!',
      addresses: user.addresses,
    });
  } catch (error: unknown) {
    console.error('Error updating address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE: Remove an address from the user's addresses array
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    if (!user.addresses) {
      return NextResponse.json(
        { success: false, error: 'Address not found.' },
        { status: 404 }
      );
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id && addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found or unauthorized.' },
        { status: 404 }
      );
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    // Remove address
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address, make another address the default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully!',
      addresses: user.addresses,
    });
  } catch (error: unknown) {
    console.error('Error deleting address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
