// Type definitions for ./node_modules/aes-js/index.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace aesjs.ModeOfOperation.cfb.prototype{
	// aesjs.ModeOfOperation.cfb.prototype.encrypt.!0
	
	/**
	 * 
	 */
	interface Encrypt0 {
	}
}
declare namespace aesjs.ModeOfOperation.cfb.prototype{
	// aesjs.ModeOfOperation.cfb.prototype.decrypt.!ret
	
	/**
	 * 
	 */
	interface DecryptRet {
	}
}
declare namespace aesjs.ModeOfOperation.ofb.prototype{
	// aesjs.ModeOfOperation.ofb.prototype.encrypt.!0
	
	/**
	 * 
	 */
	interface Encrypt0 {
	}
}
declare namespace aesjs.ModeOfOperation.ctr.prototype{
	// aesjs.ModeOfOperation.ctr.prototype.encrypt.!0
	
	/**
	 * 
	 */
	interface Encrypt0 {
	}
}
declare namespace aesjs.utils.hex{
	// aesjs.utils.hex.toBytes.!ret
	type ToBytesRet = Array<number>;
}
declare namespace aesjs.utils.utf8{
	// aesjs.utils.utf8.toBytes.!ret
	type ToBytesRet = Array<number>;
}

/**
 * The block cipher
 */
declare namespace aesjs{
	
	/**
	 * 
	 */
	interface AES {
				
		/**
		 * 
		 * @param key 
		 * @return  
		 */
		new (key : any): AES;
				
		/**
		 * 
		 */
		_prepare(): /* void */ any;
				
		/**
		 * 
		 * @param plaintext 
		 * @return  
		 */
		encrypt(plaintext : aesjs.Counter | number): Float32Array;
				
		/**
		 * 
		 * @param ciphertext 
		 * @return  
		 */
		decrypt(ciphertext : Float32Array): Float32Array;
	}
	var AES: AES;
	
	/**
	 * Counter object for CTR common mode of operation
	 */
	interface Counter {
				
		new (initialValue : number | ArrayBufferView,type:number): Counter;		
		// /**
		//  * 
		//  * @param initialValue 
		//  * @return  
		//  */
		// new (initialValue : number | ArrayBufferView): Counter;
				
		/**
		 * 
		 * @param value 
		 */
		setValue(value : number): /* void */ any;
				
		/**
		 * 
		 * @param bytes 
		 */
		setBytes(bytes : number | ArrayBufferView): /* void */ any;
				
		/**
		 * 
		 */
		increment(): /* void */ any;
	}
	var Counter: Counter;
	
	/**
	 * 
	 */
	namespace ModeOfOperation{
		
		/**
		 * Mode Of Operation - Electonic Codebook (ECB)
		 */
		interface ecb {
						
			/**
			 * 
			 * @param key 
			 * @return  
			 */
			new (key : any): ecb;
						
			/**
			 * 
			 * @param plaintext 
			 * @return  
			 */
			encrypt(plaintext : any): Float32Array;
						
			/**
			 * 
			 * @param ciphertext 
			 * @return  
			 */
			decrypt(ciphertext : any): Float32Array;
		}
		var ecb: ecb;
		
		/**
		 * Mode Of Operation - Cipher Block Chaining (CBC)
		 */
		interface cbc {
						
			/**
			 * 
			 * @param key 
			 * @param iv 
			 * @return  
			 */
			new (key : any, iv : Float32Array): cbc;
						
			/**
			 * 
			 * @param plaintext 
			 * @return  
			 */
			encrypt(plaintext : any): Float32Array;
						
			/**
			 * 
			 * @param ciphertext 
			 * @return  
			 */
			decrypt(ciphertext : any): Float32Array;
		}
		var cbc: cbc;
		
		/**
		 * Mode Of Operation - Cipher Feedback (CFB)
		 */
		interface cfb {
						
			/**
			 * 
			 * @param key 
			 * @param iv 
			 * @param segmentSize 
			 * @return  
			 */
			new (key : any, iv : Float32Array, segmentSize : number): cfb;
						
			/**
			 * 
			 * @param plaintext 
			 * @return  
			 */
			encrypt(plaintext : any): any;
						
			/**
			 * 
			 * @param ciphertext 
			 * @return  
			 */
			decrypt(ciphertext : any): any;
		}
		var cfb: cfb;
		
		/**
		 * Mode Of Operation - Output Feedback (OFB)
		 */
		interface ofb {
						
			/**
			 * 
			 * @param key 
			 * @param iv 
			 * @return  
			 */
			new (key : any, iv : Float32Array): ofb;
						
			/**
			 * Decryption is symetric
			 * @param plaintext 
			 * @return  
			 */
			encrypt(plaintext : any): any;
						
			/**
			 * 
			 */
			decrypt : /* aesjs.ModeOfOperation.ofb.prototype.encrypt */ any;
		}
		var ofb: ofb;
		
		/**
		 * Mode Of Operation - Counter (CTR)
		 */
		interface ctr {
						
			/**
			 * 
			 * @param key 
			 * @param counter 
			 * @return  
			 */
			new (key : any, counter : aesjs.Counter): ctr;
						
			/**
			 * Decryption is symetric
			 * @param plaintext 
			 * @return  
			 */
			encrypt(plaintext : any): any;
						
			/**
			 * 
			 */
			decrypt : /* aesjs.ModeOfOperation.ctr.prototype.encrypt */ any;
		}
		var ctr: ctr;
	}
	
	/**
	 * 
	 */
	namespace utils{
		
		/**
		 * 
		 */
		namespace hex{
						
			/**
			 * 
			 * @param text 
			 * @return  
			 */
			function toBytes(text : any): aesjs.utils.hex.ToBytesRet;
						
			/**
			 * 
			 * @param bytes 
			 * @return  
			 */
			function fromBytes(bytes : any): string;
		}
		
		/**
		 * 
		 */
		namespace utf8{
						
			/**
			 * 
			 * @param text 
			 * @return  
			 */
			function toBytes(text : string): aesjs.utils.utf8.ToBytesRet;
						
			/**
			 * 
			 * @param bytes 
			 * @return  
			 */
			function fromBytes(bytes : any): string;
		}
	}
	
	/**
	 * 
	 */
	namespace padding{
		
		/**
		 * 
		 */
		namespace pkcs7{
						
			/**
			 * 
			 * @param data 
			 * @return  
			 */
			function pad(data : any): Float32Array;
						
			/**
			 * 
			 * @param data 
			 * @return  
			 */
			function strip(data : any): Float32Array;
		}
	}
	
	/**
	 * 
	 */
	namespace _arrayTest{
				
		/**
		 * 
		 * @param arg 
		 * @param copy 
		 * @return  
		 */
		function coerceArray(arg : Array<number> | Float32Array, copy : boolean): Array<number> | Float32Array;
				
		/**
		 * 
		 * @param length 
		 * @return  
		 */
		function createArray(length : number): Float32Array;
				
		/**
		 * 
		 * @param sourceArray 
		 * @param targetArray 
		 * @param targetStart 
		 * @param sourceStart 
		 * @param sourceEnd 
		 */
		function copyArray(sourceArray : Float32Array, targetArray : Float32Array, targetStart : number, sourceStart : number, sourceEnd : number): /* void */ any;
	}
		
	/**
	 * 
	 */
	export var _aesjs : /* aesjs */ any;
}
