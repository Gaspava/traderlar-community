import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== TEST UPLOAD ENDPOINT ===');
  
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    
    console.log('Received:', {
      name,
      fileExists: !!file,
      fileName: file?.name,
      fileSize: file?.size
    });
    
    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }
    
    const fileContent = await file.text();
    console.log('File content length:', fileContent.length);
    console.log('File content preview:', fileContent.substring(0, 200));
    
    return NextResponse.json({ 
      success: true,
      message: 'File received successfully',
      details: {
        name,
        fileName: file.name,
        fileSize: file.size,
        contentLength: fileContent.length
      }
    });
    
  } catch (error) {
    console.error('Test upload error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}