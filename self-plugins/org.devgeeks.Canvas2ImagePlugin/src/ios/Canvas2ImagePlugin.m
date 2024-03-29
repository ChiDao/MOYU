//
//  Canvas2ImagePlugin.m
//  Canvas2ImagePlugin PhoneGap/Cordova plugin
//
//  Created by Tommy-Carlos Williams on 29/03/12.
//  Copyright (c) 2012 Tommy-Carlos Williams. All rights reserved.
//	MIT Licensed
//

#import "Canvas2ImagePlugin.h"
#import <Cordova/CDV.h>

@implementation Canvas2ImagePlugin
@synthesize callbackId;

//-(CDVPlugin*) initWithWebView:(UIWebView*)theWebView
//{
//    self = (Canvas2ImagePlugin*)[super initWithWebView:theWebView];
//    return self;
//}

- (void)saveImageDataToLibrary:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
	NSData* imageData = [NSData dataFromBase64String:[command.arguments objectAtIndex:0]];
	
	UIImage* image = [[[UIImage alloc] initWithData:imageData] autorelease];

    ALAssetsLibrary *library = [[[ALAssetsLibrary alloc] init] autorelease];
    NSLog(@"SCATTO: Inizio salvataggio in library...");
    [library writeImageToSavedPhotosAlbum:[image CGImage] metadata:nil completionBlock:^(NSURL *newURL, NSError *error) {
        if (error){
            NSLog(@"SCATTO: Salvataggio in library: ERRORE");
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.description];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        } else {
            NSLog(@"SCATTO: Salvataggio in library: OK %@", newURL);
            NSString * imgUrl = [newURL absoluteString];
            CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString:imgUrl];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
    }];	
	// UIImageWriteToSavedPhotosAlbum(image, self, @selector(image:didFinishSavingWithError:contextInfo:), nil);
	
}

- (void)removeImgFromLibrary:(CDVInvokedUrlCommand*)command
{
    self.callbackId = command.callbackId;
    NSURL *imgURL = [NSURL URLWithString:[command.arguments objectAtIndex:0]];
    
    ALAssetsLibrary* library = [[ALAssetsLibrary alloc]init];
    
    [library assetForURL:imgURL resultBlock:^(ALAsset *asset)
     {
         [asset setImageData:NULL metadata:NULL completionBlock:^(NSURL *assetURL, NSError *error)
          {
              if (error != NULL){
                  NSLog(@"ERROR: %@",error);
              }else{
                  NSLog(@"删除成功!");
              }
          }];

     } failureBlock:^(NSError *error)
     {
         NSLog(@"ERROR: %@",error);
     }];

}

// - (void)image:(UIImage *)image didFinishSavingWithError:(NSError *)error contextInfo:(void *)contextInfo
// {
//     // Was there an error?
//     if (error != NULL)
//     {
//         // Show error message...
//         NSLog(@"ERROR: %@",error);
// 		CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString:error.description];
// 		[self.webView stringByEvaluatingJavaScriptFromString:[result toErrorCallbackString: self.callbackId]];
//     }
//     else  // No errors
//     {
//         // Show message image successfully saved
//         NSLog(@"IMAGE SAVED!");
// 		CDVPluginResult* result = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsString:@"Image saved"];
// 		[self.webView stringByEvaluatingJavaScriptFromString:[result toSuccessCallbackString: self.callbackId]];
//     }
// }

- (void)dealloc
{	
	[callbackId release];
    [super dealloc];
}


@end
